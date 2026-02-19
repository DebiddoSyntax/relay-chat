import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.db.models import Q
from ..models import Chat, Message, MessageReadBy, UserChat
import asyncio
from django.utils import timezone
import uuid
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os
import binascii
from os import urandom
from ..utils.decrypt import decrypt_message




key_hex = os.environ.get("SERVER_AES_KEY")
if not key_hex:
    raise ValueError("SERVER_AES_KEY not set in environment variables")

SERVER_AES_KEY = binascii.unhexlify(key_hex) 
aesgcm = AESGCM(SERVER_AES_KEY)

User = get_user_model()
logger = logging.getLogger(__name__)


class ChatConsumer(AsyncWebsocketConsumer):
    # ==== MAIN SOCKET METHODS ====

    # connect 
    async def connect(self):
        self.chat_id = self.scope['url_route']['kwargs']['chat_id']
        self.group_name = f'chat_{self.chat_id}'
        self.user = self.scope.get('user')
        
        # Check for authentication errors
        auth_error = self.scope.get("auth_error")
        if auth_error:
            await self.accept()
            error_messages = {
                'no_token': 'No authentication token provided',
                'token_expired': 'Your session has expired. Please login again.',
                'invalid_token': 'Invalid authentication token',
                'server_error': 'Server error during authentication'
            }
            
            # send error message 
            await self.send(json.dumps({
                "type": "error",
                "error": auth_error,
                "message": error_messages.get(auth_error, 'Authentication failed')
            }))
            
            await self.close(code=4001)
            return
        
        # Reject unauthenticated users
        if not self.user or self.user.is_anonymous:
            await self.accept()
            await self.send(json.dumps({
                "type": "error",
                "error": "unauthorized",
                "message": "You are not authenticated"
            }))
            await self.close(code=4001)
            return
        
        

        # Verify user has access to this chat
        try:
            has_access = await self.check_chat_access(self.chat_id, self.user.id)
            if not has_access:
                await self.close(code=4003)
                return
        except Exception as e:
            await self.close(code=4000)
            return
        
        # Add to channel group
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        
        # Send connection confirmation with unread count
        # unread_count = await self.get_unread_count(self.chat_id, self.user.id)
        await self.send(text_data=json.dumps({
            'type': 'connection',
            'status': 'connected',
            # 'chat_id': str(self.chat_id),
            # 'user_id': str(self.user.id),
            # 'sender_id': str(self.user.id),
            # 'unread_count': unread_count
        }))


    # disconnect 
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)


    # receive
    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type', 'message')
            
            if message_type == 'message':
                await self.handle_message(data)
            elif message_type == 'read':
                await self.handle_read_receipt(data)
            else:
                await self.send_error(f"Unknown message type: {message_type}")
                
        except json.JSONDecodeError:
            await self.send_error("Invalid JSON format")
        except Exception as e:
            await self.send_error("An error occurred processing your request")

    # ==== MAIN SOCKET METHODS END ====




    # ==== EVENT HANDLERS ====

    # handle new users message 
    async def handle_message(self, data):
        content = data.get('content', '').strip()
        message_type = data.get('message_type', 'text')
        
        # Validate content
        if not content:
            await self.send_error("Message content cannot be empty")
            return
        
        if len(content) > 10000:
            await self.send_error("Message is too long (max 10000 characters)")
            return
        
        # Save message to database
        try:
            message = await self.save_message(self.chat_id, self.user.id, content, message_type)

            decrypt_content = decrypt_message(message.content, message.iv)
            
            # Prepare payload
            payload = {
                'type': 'message',
                'id': str(message.id),
                'chat_id': str(message.chat.id),
                'sender': {
                    'id': str(message.sender.id),
                    'email': message.sender.email,
                },
                'sender_id': str(message.sender.id),
                'content': decrypt_content,
                'message_type': message.type,
                'created_at': message.created_at.isoformat(),
            }
            
            # Broadcast to all users in chat
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'chat.message',
                    'message': payload
                }
            )

            # get all chat users
            participants = await self.get_chat_participants(self.chat_id)

            # get chat object 
            chat = await database_sync_to_async(Chat.objects.get)(id=self.chat_id)


            # check chat type and set it
            is_ai_chat = await self.is_ai_chat(self.chat_id)

            if is_ai_chat:
                chat_type = "ai"
            elif chat.is_group:
                chat_type = "group"
            else:
                chat_type = "private"


            # broadcast to all users in the chat 
            for user_id in participants:
                if user_id != self.user.id:
                    await self.channel_layer.group_send(
                        f"user_{user_id}",
                        {
                            "type": "notify",
                            "payload": {
                                "type": "new_message",
                                "chat_id": str(self.chat_id),
                                "chat_type": chat_type,
                                "content": decrypt_content,
                                "created_at": message.created_at.isoformat(),
                                "sender_id": str(self.user.id),
                            }
                        }
                    )


            if is_ai_chat:
                await self.channel_layer.group_send(
                    self.group_name,
                    {
                        "type": "chat.typing",
                        "sender": "ai",
                        "typing": True,
                    }
                )

                asyncio.create_task(
                    self.handle_ai_response(message)
                )
            
        except Exception as e:
            logger.error(f"Error saving message: {e}", exc_info=True)
            await self.send_error("Failed to send message")



    # handle ai response
    async def handle_ai_response(self, user_message):
        from google import genai
        from asgiref.sync import sync_to_async

        client = genai.Client()
        ai_user = await self.get_ai_user()
        now = timezone.now()

        SYSTEM_PROMPT = f"""
            Current date and time: {now}

            Your name is Sydeny or Sydney AI

            My name is "{self.user.firstname} {self.user.lastname}"

            Assume this date is correct.
            Do not question it or mention training cutoffs.
            Answer using this date as "now".
            Speak naturally

            You are a modern, conversational AI chatting inside a messaging app.
            Speak naturally, like a real person.
            Do not mention training data, model limitations, or cutoff dates.
            Keep replies short unless the user asks for depth.
            Stay in character at all times.
        """
      
        try:
            decrypt_prompt = decrypt_message(user_message.content, user_message.iv)
        except Exception as e:
            logger.warning(f"Failed to decrypt user message: {e}")
            return
        
        prompt = decrypt_prompt.strip()
        if not prompt:
            return


        # Notify frontend that AI is typing
        await self.channel_layer.group_send(
            self.group_name,
            {"type": "chat.typing", "sender": "ai", "typing": True}
        )

        await asyncio.sleep(0)

        # ai failed to respond payload
        failed_payload = {
            'type': 'message',
            'id': str(uuid.uuid4()),
            'chat_id': str(self.chat_id),
            'sender': {
                'id': str(ai_user.id),
                'email': ai_user.email,
            },
            'sender_id': str(ai_user.id),
            'content': "Sorry, I’m having trouble responding right now.",
            'message_type': 'text',
            'created_at': now.isoformat(),
            'meta': {
                'ephemeral': True,
                'ai_failed': True
            }
        }

        try:
            final_prompt = [{"role": "system", "parts": [{"text": SYSTEM_PROMPT}]}, {"role": "user", "parts": [{"text": prompt}]}]

            response = await sync_to_async(
                client.models.generate_content,
                thread_sensitive=False
            )(model="gemini-3-flash-preview", contents=final_prompt)

            ai_text = (response.text or "").strip()
            if not ai_text:
                raise ValueError("AI returned empty response")

            # Save AI message if its not empty
            message = await self.save_message(self.chat_id, ai_user.id, ai_text, "text")

            # decrypt message
            decrypt_content = decrypt_message(message.content, message.iv)

            # ai send payload
            payload = {
                'type': 'message',
                'id': str(message.id),
                'chat_id': str(message.chat.id),
                'sender': {
                    'id': str(ai_user.id),
                    'email': ai_user.email,
                },
                'sender_id': str(ai_user.id),
                'content': decrypt_content,
                'message_type': message.type,
                'created_at': message.created_at.isoformat(),
            }

   
            await self.channel_layer.group_send(self.group_name, {'type': 'chat.message', 'message': payload})


            participants = await self.get_chat_participants(self.chat_id)
            for user_id in participants:
                if user_id != self.user.id:
                    await self.channel_layer.group_send(
                        f"user_{user_id}",
                        {
                            "type": "notify",
                            "payload": {
                                "type": "new_message",
                                "chat_id": str(self.chat_id),
                                "content": decrypt_content,
                                "created_at": message.created_at.isoformat(),
                                "sender_id": str(self.user.id),
                            }
                        }
                    )


        except Exception as e:
            # Send failed message
            await self.channel_layer.group_send(self.group_name, {'type': 'chat.message', 'message': failed_payload})

        finally:
            await self.channel_layer.group_send(
                self.group_name,
                {"type": "chat.typing", "sender": "ai", "typing": False}
            )



    # read receipt 
    async def handle_read_receipt(self, data):
        message_id = data.get('message_id')
        
        if not message_id:
            await self.send_error("message_id is required")
            return
        
        try:
            await self.mark_message_read(message_id, self.user.id)
            
            # Broadcast read receipt
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'message.read',
                    'message_id': str(message_id),
                    'user_id': str(self.user.id),
                    'email': self.user.email,
                    'read_at': timezone.now().isoformat()
                }
            )
            
        except Exception as e:
            await self.send_error("Failed to mark message as read")

   

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event['message']))

    
    async def chat_typing(self, event):
        logger.info(f"chat_typing called with event: {event}")
        await self.send(text_data=json.dumps({
            "type": "typing",
            "user": event.get("sender"), 
            "typing": event.get("typing", False)
        }))


    async def message_read(self, event):
        try:
            await self.send(text_data=json.dumps({
                'type': 'read',
                'message_id': event['message_id'],
                'user_id': event['user_id'],
                'email': event['email'],
                'read_at': event['read_at']
            }))
        except Message.DoesNotExist:
            return


    # ==== EVENT HANDLERS END ====




    # ==== DATABASE OPERATIONS ====
    
    @database_sync_to_async
    def is_ai_chat(self, chat_id):
        return Chat.objects.filter(id=chat_id, is_ai=True).exists()


    @database_sync_to_async
    def get_ai_user(self):
        return User.objects.get(email="ai@system.local")


    @database_sync_to_async
    def check_chat_access(self, chat_id, user_id):
        return UserChat.objects.filter(
            chat_id=chat_id,
            user_id=user_id
        ).exists()


    @database_sync_to_async
    def save_message(self, chat_id, sender_id, content, message_type='text'):
        chat = Chat.objects.get(id=chat_id)
        sender = User.objects.get(id=sender_id)
        
        iv = urandom(12)
        ciphertext = aesgcm.encrypt(iv, content.encode(), None)

        message = Message.objects.create(
            chat=chat,
            sender=sender,
            content=binascii.hexlify(ciphertext).decode(),
            iv=binascii.hexlify(iv).decode(),
            type=message_type
        )
        
  
        chat.last_message = message
        chat.updated_at = timezone.now()
        chat.save(update_fields=['last_message', 'updated_at'])
        
        return message
    

    @database_sync_to_async
    def get_chat_participants(self, chat_id):
        return list(
            UserChat.objects.filter(chat_id=chat_id)
            .values_list("user_id", flat=True)
        )


    @database_sync_to_async
    def mark_message_read(self, message_id, user_id):
        message = Message.objects.get(id=message_id)
        user = User.objects.get(id=user_id)
        
        # Don't mark own messages as read
        if message.sender_id == user_id:
            return
        
        MessageReadBy.objects.get_or_create(
            message=message,
            user=user,
            defaults={'read_at': timezone.now()}
        )


    @database_sync_to_async
    def get_unread_count(self, chat_id, user_id):
        return Message.objects.filter(
            chat_id=chat_id
        ).exclude(
            Q(sender_id=user_id) | Q(read_by__id=user_id)
        ).count()


    # Utility methods  
    async def send_error(self, error_message):
        await self.send(text_data=json.dumps({
            'type': 'error',
            'error': error_message
        }))
        # logger.warning(f"Error sent to client: {error_message}")
    
    
    # ==== DATABASE OPERATIONS END ====