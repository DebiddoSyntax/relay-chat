from django.urls import path
from . import views


urlpatterns = [
    path('chats/', views.chats),
    path('signup/', views.signup_view)
]