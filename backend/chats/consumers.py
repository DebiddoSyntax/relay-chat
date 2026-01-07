import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import Q
from .models import Chat, Message, MessageReadBy, UserChat

User = get_user_model()
logger = logging.getLogger(__name__)


class ChatConsumer(AsyncWebsocketConsumer):
    # connect 
    async def connect(self):
        self.user = self.scope.get('user')
        
        # Reject unauthenticated users
        if not self.user or self.user.is_anonymous:
            logger.warning("Unauthenticated user attempted to connect")
            await self.close(code=4001)
            return
        
        self.chat_id = self.scope['url_route']['kwargs']['chat_id']
        self.group_name = f'chat_{self.chat_id}'
        

        # Verify user has access to this chat
        try:
            has_access = await self.check_chat_access(self.chat_id, self.user.id)
            if not has_access:
                logger.warning(f"User {self.user.id} denied access to chat {self.chat_id}")
                await self.close(code=4003)
                return
        except Exception as e:
            logger.error(f"Error checking chat access: {e}")
            await self.close(code=4000)
            return
        
        # Add to channel group
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        
        # Send connection confirmation with unread count
        unread_count = await self.get_unread_count(self.chat_id, self.user.id)
        await self.send(text_data=json.dumps({
            'type': 'connection',
            'status': 'connected',
            'chat_id': str(self.chat_id),
            'user_id': str(self.user.id),
            'sender_id': str(self.user.id),
            'unread_count': unread_count
        }))
        
        logger.info(f"User {self.user.id} connected to chat {self.chat_id}")



    # disconnect 
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)
        
        logger.info(f"User {self.user.id} disconnected from chat {self.chat_id}")



    # receive new websocket message
    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type', 'message')
            
            # Route to appropriate handler based on type
            if message_type == 'message':
                await self.handle_message(data)
            elif message_type == 'read':
                await self.handle_read_receipt(data)
            else:
                await self.send_error(f"Unknown message type: {message_type}")
                
        except json.JSONDecodeError:
            await self.send_error("Invalid JSON format")
        except Exception as e:
            logger.error(f"Error in receive: {e}", exc_info=True)
            await self.send_error("An error occurred processing your request")



    # handle new users message 
    async def handle_message(self, data):
        content = data.get('content', '').strip()
        message_type = data.get('message_type', 'text')
        
        # Validate content
        if not content:
            await self.send_error("Message content cannot be empty")
            return
        
        if len(content) > 10000:  # Max message length
            await self.send_error("Message is too long (max 10000 characters)")
            return
        
        # Save message to database
        try:
            message = await self.save_message(
                self.chat_id, 
                self.user.id, 
                content,
                message_type
            )
            
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
                'content': message.content,
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
            
            logger.info(f"Message {message.id} sent in chat {self.chat_id}")
            
        except Exception as e:
            logger.error(f"Error saving message: {e}", exc_info=True)
            await self.send_error("Failed to send message")

    

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
            logger.error(f"Error marking message as read: {e}")
            await self.send_error("Failed to mark message as read")

   
    # Event handlers (called by channel layer)
    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event['message']))

    
    async def message_read(self, event):
        await self.send(text_data=json.dumps({
            'type': 'read',
            'message_id': event['message_id'],
            'user_id': event['user_id'],
            'email': event['email'],
            'read_at': event['read_at']
        }))

    

    # Database operations
    
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
        
        message = Message.objects.create(
            chat=chat,
            sender=sender,
            content=content,
            type=message_type
        )
        
        # Update chat's last message and timestamp
        chat.last_message = message
        chat.updated_at = timezone.now()
        chat.save(update_fields=['last_message', 'updated_at'])
        
        return message

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
        logger.warning(f"Error sent to client: {error_message}")