import json
from channels.generic.websocket import AsyncWebsocketConsumer




class UserConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get("user")
        self.group_name = None

        if not self.user or self.user.is_anonymous:
            await self.close(code=4001)
            return

        self.group_name = f"user_{self.user.id}"
        
        await self.accept()

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
