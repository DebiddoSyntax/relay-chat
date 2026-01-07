from django.urls import path
from . import views


urlpatterns = [
    # chats urls 
    path('chat/all/', views.get_chat_view),
    path('chat/start/', views.start_chat_view),
    path("chat/<uuid:chat_id>/messages/", views.chat_message_list_view),

    # auth urls 
    path('auth/signup/', views.signup_view),
    path('auth/login/', views.login_view),
    path('auth/refresh/', views.refresh_token_view),
]