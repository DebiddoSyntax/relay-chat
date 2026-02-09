import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
import redis.asyncio as redis

logger = logging.getLogger(__name__)

REDIS_URL = "redis://localhost:6379"

class VideoConsumer(AsyncWebsocketConsumer):
    redis_client = None

    @classmethod
    async def get_redis(cls):
        if cls.redis_client is None:
            cls.redis_client = await redis.from_url(REDIS_URL, decode_responses=True)
        return cls.redis_client

    async def connect(self):
        self.user = self.scope.get("user")
        if not self.user or self.user.is_anonymous:
            await self.close(code=self.scope.get("close_code", 4001))
            return

        self.chat_id = self.scope["url_route"]["kwargs"]["chat_id"]
        self.room_name = f"video_{self.chat_id}"
        self.room_group_name = self.room_name

        if not await self.check_chat_access(self.chat_id, self.user.id):
            await self.close(code=4003)
            return

        redis_client = await self.get_redis()
        participants_key = f"{self.room_name}:users"


        users_before = await redis_client.smembers(participants_key)
        user_count_before = len(users_before) if users_before else 0



        if user_count_before >= 2:
            logger.warning(f"❌ Room full: {user_count_before} users already in {self.room_name}")
            await self.close(code=4004)
            return

 
        is_first_user = user_count_before == 0
        role = "caller" if is_first_user else "callee"


        await redis_client.sadd(participants_key, self.channel_name)


        await self.accept()
        await self.send(text_data=json.dumps({"role": role}))


        await self.channel_layer.group_add(self.room_group_name, self.channel_name)


        if is_first_user:
            participants = await self.get_chat_participants(self.chat_id)
            for user_id in participants:
                if user_id != self.user.id:
                    await self.channel_layer.group_send(
                        f"user_{user_id}",
                        {
                            "type": "notify",
                            "payload": {
                                "type": "new_call",
                                "chat_id": str(self.chat_id),
                                "sender_name": f"{self.user.firstname} {self.user.lastname}",
                                "calling_me": True
                            }
                        }
                    )


        users_after = await redis_client.smembers(participants_key)
        user_count_after = len(users_after) if users_after else 0

        if user_count_after == 2:
            await self.channel_layer.group_send(
                self.room_group_name,
                {"type": "both_connected"}
            )



    async def disconnect(self, close_code):
        try:
            redis_client = await self.get_redis()
            participants_key = f"{self.room_name}:users"
            await redis_client.srem(participants_key, self.channel_name)
            logger.info(f"❌ User disconnected from room {self.room_name}")
        except Exception as e:
            logger.error(f"❌ Error during disconnect: {e}", exc_info=True)

        if self.room_group_name:
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)



    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = list(data.keys())[0] if data else "unknown"

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "signal",
                    "message": data,
                    "sender": self.channel_name,
                }
            )
            logger.info(f"✅ Broadcasted {message_type} to group {self.room_group_name}")

        except json.JSONDecodeError as e:
            logger.error(f"❌ Invalid JSON received: {e}")
        except Exception as e:
            logger.error(f"❌ Error broadcasting message in room {self.room_name}: {e}", exc_info=True)


    async def signal(self, event):
        if event["sender"] != self.channel_name:
            await self.send(text_data=json.dumps(event["message"]))
            logger.info(f"✅ Forwarded {list(event['message'].keys())[0]} to {self.channel_name}")


    async def both_connected(self, event):
        await self.send(text_data=json.dumps({"both_connected": True}))
        logger.info(f"📢 Sent both_connected notification to {self.channel_name}")


    @database_sync_to_async
    def check_chat_access(self, chat_id, user_id):
        from ..models import UserChat
        return UserChat.objects.filter(chat_id=chat_id, user_id=user_id).exists()

    @database_sync_to_async
    def get_chat_participants(self, chat_id):
        from ..models import UserChat
        return list(UserChat.objects.filter(chat_id=chat_id).values_list("user_id", flat=True))