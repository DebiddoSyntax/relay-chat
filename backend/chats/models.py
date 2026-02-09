# models.py
import uuid
from django.db import models
from django.utils import timezone
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin


# 1. User Manager
class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)  # hashes password
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)



# 2. User model
class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    firstname = models.CharField(max_length=255, null=True)
    lastname = models.CharField(max_length=255, null=True)
    username = models.CharField(max_length=255)
    image_url = models.URLField(max_length=255, null=True)
    
    # Role field
    ROLE_CHOICES = (
        ('user', 'User'),
        ('admin', 'Admin'),
        ('moderator', 'Moderator'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')

    # Password reset
    reset_password_token = models.CharField(max_length=255, null=True, blank=True)
    reset_password_expiry = models.DateTimeField(null=True, blank=True)

    # Standard fields
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email' 
    REQUIRED_FIELDS = ['username'] 

    def __str__(self):
        return self.email


class RefreshToken(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    token = models.CharField(max_length=255, unique=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="refresh_tokens")
    created_at = models.DateTimeField(default=timezone.now)

class Chat(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, null=True, blank=True)
    is_group = models.BooleanField(default=False)
    is_ai = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    users = models.ManyToManyField(User, through='UserChat', related_name='chats')
    image_url = models.URLField(max_length=255, null=True)

    
    last_message = models.ForeignKey(
        'Message', 
        null=True, 
        blank=True, 
        on_delete=models.SET_NULL,
        related_name='+'
    )
    updated_at = models.DateTimeField(auto_now=True)

class UserChat(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE)
    role = models.CharField(max_length=50, null=True, blank=True)
    joined_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ('user', 'chat')

class Message(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='messages')
    content = models.TextField()
    iv = models.CharField(max_length=24, null=True, blank=True)
    type = models.CharField(max_length=50, default='text')
    created_at = models.DateTimeField(default=timezone.now)
    read_by = models.ManyToManyField(User, through='MessageReadBy', related_name='messages_read')

    class Meta:
        indexes = [
            models.Index(fields=['chat', '-created_at']),
            models.Index(fields=['sender', '-created_at']),
        ]
        ordering = ['-created_at']

class MessageReadBy(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    message = models.ForeignKey(Message, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    read_at = models.DateTimeField(default=timezone.now)