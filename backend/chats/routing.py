from django.urls import re_path
from .consumers.chat_consumer import ChatConsumer
from .consumers.user_consumer import UserConsumer
from .consumers.video_consumer import VideoConsumer

websocket_urlpatterns = [
    re_path(r"ws/chat/(?P<chat_id>[0-9a-f-]+)/$", ChatConsumer.as_asgi()),
    re_path(r"ws/user/$", UserConsumer.as_asgi()),
    re_path(r"ws/video/(?P<chat_id>[0-9a-f-]+)/$", VideoConsumer.as_asgi()),
]
