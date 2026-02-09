from django.urls import path
from . import views


urlpatterns = [
    path('image/auth/', views.image_auth),

    # chats urls 
    path('chat/all/', views.get_chat_view),
    path('chat/start/', views.start_chat_view),
    path("chat/<uuid:chat_id>/messages/", views.chat_message_list_view),
    path('chat/ai/', views.ai_chat_view),
    
    # group urls 
    path('groupchat/all/', views.get_groupchat_view),
    path('groupchat/start/', views.start_groupchat_view),
    path('groupchat/join/', views.join_groupchat_view),
    path('groupchat/add/', views.addmember_groupchat_view),
    path('groupchat/<uuid:chat_id>/members/', views.viewmember_groupchat_view),

    # auth urls 
    path('auth/signup/', views.signup_view),
    path('auth/login/', views.login_view),
    path('auth/refresh/', views.refresh_token_view),
    path('auth/password/update/', views.change_pass_view),
    path('auth/user/update/', views.update_profile_view),
]