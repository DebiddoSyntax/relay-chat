from django.urls import path
from . import views


urlpatterns = [
    path('chats/', views.chats),
    path('auth/signup/', views.signup_view),
    path('auth/login/', views.login_view)
]