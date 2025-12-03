# chat/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import Chat, Message

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.chat_id = self.scope['url_route']['kwargs']['chat_id'] 
        self.group_name = f'chat_{self.chat_id}'

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()


    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)



    async def receive(self, text_data):
        data = json.loads(text_data)
        
        sender_id = data.get('sender_id')
        content = data.get('content', '')

        message = await self.save_message(self.chat_id, sender_id, content)

        payload = {
            'id': message.id,
            'chat': message.chat.id,
            'sender': message.sender.username,
            'sender_id': message.sender.id,
            'content': message.content,
            'type': message.type,
            'created_at': message.created_at.isoformat(),
        }

        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'chat.message',
                'message': payload
            }
        )



    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event['message']))



    @database_sync_to_async
    def save_message(self, chat_id, sender_id, content):
        chat = Chat.objects.get(id=chat_id)
        sender = User.objects.get(id=sender_id)

        return Message.objects.create(
            chat=chat,
            sender=sender,
            content=content
        )
