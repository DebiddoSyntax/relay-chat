import json
from channels.generic.websocket import AsyncWebsocketConsumer




class UserConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get("user")
        self.group_name = None

        
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

        self.group_name = f"user_{self.user.id}"
        
        await self.accept()
        await self.send(text_data=json.dumps({
            'type': 'connection',
            'status': 'connected',
        }))


        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )


    async def disconnect(self, close_code):
        if isinstance(self.group_name, str):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )

    async def notify(self, event):
        # await self.send(text_data=json.dumps(event["payload"]))
        payload = event.get("payload")
        if payload is None:
            return

        await self.send(text_data=json.dumps(payload))
