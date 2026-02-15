import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
import redis.asyncio as redis
from django.utils import timezone
from urllib.parse import parse_qs


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
            await self.accept()
            await self.close(code=4001)
            return
 
        query_params = parse_qs(self.scope["query_string"].decode())
        
        is_audio = query_params.get("audio", ["false"])[0].lower() == "true"


        self.chat_id = self.scope["url_route"]["kwargs"]["chat_id"]
        self.user_id = str(self.user.id)
        self.room_name = f"video_{self.chat_id}"
        self.room_group_name = self.room_name
        
        
        self.activity_timestamp_key = f"{self.room_name}:activity:{self.channel_name}"
        self.user_key = f"{self.room_name}:user:{self.user_id}"

        if not await self.check_chat_access(self.chat_id, self.user.id):
            await self.close(code=4003)
            return

        redis_client = await self.get_redis()
        participants_key = f"{self.room_name}:users"


        current_users = await redis_client.smembers(participants_key)
        user_count_before = len(current_users) if current_users else 0


        if self.user_id in current_users:
            # logger.info(f"User {self.user_id} reconnecting (stale connection detected)")
            # Remove the stale connection
            old_channel_name = await redis_client.get(self.user_key)
            if old_channel_name:
                await redis_client.delete(f"{self.room_name}:activity:{old_channel_name}")
            user_count_before -= 1

        if user_count_before >= 2:
            logger.info('more than 2 users tried to connect')
            await self.close(code=4004)
            return

        is_first_user = user_count_before == 0
        role = "caller" if is_first_user else "callee"

     
        await redis_client.sadd(participants_key, self.user_id)

        await redis_client.set(self.user_key, self.channel_name)
        
        await redis_client.expire(participants_key, 300)
        
        await redis_client.setex(self.activity_timestamp_key, 300, 'active')

        await self.accept()
        await self.send(text_data=json.dumps({"role": role}))

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        if is_first_user:
            participants = await self.get_chat_participants(self.chat_id)
            for user_id, image_url in participants:
                if user_id != self.user.id:
                    await self.channel_layer.group_send(
                        f"user_{user_id}",
                        {
                            "type": "notify",
                            "payload": {
                                "type": "new_call",
                                "chat_id": str(self.chat_id),
                                "sender_name": f"{self.user.firstname} {self.user.lastname}",
                                "image_url": image_url,
                                "isAudio": is_audio,
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
        redis_client = await self.get_redis()
        
        # Only proceed if the consumer was properly initialized
        if not hasattr(self, 'room_name') or not hasattr(self, 'user_id'):
            return
        
        participants_key = f"{self.room_name}:users"
        
        await redis_client.srem(participants_key, self.user_id)
        await redis_client.delete(self.activity_timestamp_key)
        await redis_client.delete(self.user_key)
        
        remaining = await redis_client.scard(participants_key)
        if remaining == 0:
            await redis_client.expire(participants_key, 300)
        else:
            await self.check_stale_users()
        
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)


    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            redis_client = await self.get_redis()
            await redis_client.setex(self.activity_timestamp_key, 300, "active")

            if data.get("disconnect"):
                logger.info(f"👤 User {self.user_id} is leaving the call")
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "user_left",
                        "message": data.get("message", "User left the call"),
                        "role": data.get("role"),
                        "sender": self.channel_name,
                    }
                )

                participants = await self.get_chat_participants(self.chat_id)
                for user_id, image_url in participants:
                    if user_id != self.user.id:
                        await self.channel_layer.group_send(
                            f"user_{user_id}",
                            {
                                "type": "notify",
                                "payload": {
                                    "type": "stop_call"
                                }
                            }
                        )
                return
            
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "signal",
                    "message": data,
                    "sender": self.channel_name,
                }
            )

        except json.JSONDecodeError as e:
            logger.error(f"❌ Invalid JSON received: {e}")
        except Exception as e:
            logger.error(f"❌ Error broadcasting message in room {self.room_name}: {e}", exc_info=True)

    async def user_left(self, event):
        if event["sender"] != self.channel_name:
            await self.send(text_data=json.dumps({
                "user_left": True,
                "message": event["message"]
            }))
            logger.info(f"📢 Notified {self.channel_name} that other user left")

    async def signal(self, event):
        if event["sender"] != self.channel_name:
            await self.send(text_data=json.dumps(event["message"]))

    async def both_connected(self, event):
        await self.send(text_data=json.dumps({"both_connected": True}))

    async def check_stale_users(self):
        """Remove stale participants whose activity has expired"""
        redis_client = await self.get_redis()
        participants_key = f"{self.room_name}:users"
        participants = await redis_client.smembers(participants_key)
        
        for user_id in participants:
            user_key = f"{self.room_name}:user:{user_id}"
            channel_name = await redis_client.get(user_key)
            activity_key = f"{self.room_name}:activity:{channel_name}" if channel_name else None
            
            # If no activity record exists, the user is stale
            if not activity_key or not await redis_client.exists(activity_key):
                logger.info(f"Removing stale user {user_id} from room")
                await redis_client.srem(participants_key, user_id)
                if channel_name:
                    await redis_client.delete(activity_key)
                await redis_client.delete(user_key)

    @database_sync_to_async
    def check_chat_access(self, chat_id, user_id):
        from ..models import UserChat
        return UserChat.objects.filter(chat_id=chat_id, user_id=user_id).exists()

    @database_sync_to_async
    def get_chat_participants(self, chat_id):
        from ..models import UserChat
        return list(UserChat.objects.filter(chat_id=chat_id).values_list("user_id", "user__image_url"))