from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Chat, UserChat, Message
from .utils.decrypt import decrypt_message
from .utils.verifyCaptcha import verifyCaptcha
import requests
import os


User = get_user_model()

# signup serializer 
class SignupSerializer(serializers.ModelSerializer):
    firstname = serializers.CharField(
        required=True,
        allow_blank=False,
        error_messages={
            "required": "firstname is missing",
            "blank": "firstname is missing",
        },
    )

    lastname = serializers.CharField(
        required=True,
        allow_blank=False,
        error_messages={
            "required": "lastname is missing",
            "blank": "lastname is missing",
        },
    )

    email = serializers.EmailField(
        required=True,
        allow_blank=False,
        error_messages={
            "required": "email is missing",
            "blank": "email is missing",
        },
    )

    password = serializers.CharField(
        required=True,
        allow_blank=False,
        write_only=True,
        error_messages={
            "required": "password is missing",
            "blank": "password is missing",
        },
    )

    # captchaToken = serializers.CharField(
    #     required=True,
    #     allow_blank=False,
    #     write_only=True,
    #     error_messages={
    #         "required": "captcha is missing",
    #         "blank": "captcha is missing",
    #     },
    # )

    class Meta:
        model = User
        fields = [ 'firstname', 'lastname', 'email', 'password', 'captchaToken']
        # fields = [ 'firstname', 'lastname', 'email', 'password', 'captchaToken']
    
    # def validate(self, data):
    #     captcha_token = data.get("captchaToken")

    #     if not verifyCaptcha(captcha_token):
    #         raise serializers.ValidationError(
    #             {"captcha": "CAPTCHA verification failed."}
    #         )

    def validate_email(self, value):
        email = value.lower()
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError('Email already exists')
        return email

    def create(self, validated_data): 
        user = User(
            email=validated_data['email'],
            firstname=validated_data['firstname'],
            lastname=validated_data['lastname'],
        )
        user.set_password(validated_data['password'])
        user.save()

        refresh = RefreshToken.for_user(user)

        return {
            'accessToken': str(refresh.access_token),
            'refreshToken': str(refresh),
            'user': user
        }
    



class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(
        required=True,
        allow_blank=False,
        error_messages={
            "required": "email is missing",
            "blank": "email is missing",
        },
    )

    password = serializers.CharField(
        required=True,
        allow_blank=False,
        write_only=True,
        error_messages={
            "required": "password is missing",
            "blank": "password is missing",
        },
    )

    # captchaToken = serializers.CharField(
    #     required=True,
    #     allow_blank=False,
    #     write_only=True,
    #     error_messages={
    #         "required": "captcha is missing",
    #         "blank": "captcha is missing",
    #     },
    # )

    class Meta:
        model = User
        fields = ['email', 'password']
        # fields = ['email', 'password', 'captchaToken']

    def validate(self, data):
        # captcha_token = data.get("captchaToken")

        # if not verifyCaptcha(captcha_token):
        #     raise serializers.ValidationError(
        #         {"captcha": "CAPTCHA verification failed."}
        #     )

        email = data['email'].lower()
        password = data['password']
        user = authenticate(username=email, password=password)

        if not user:
            raise AuthenticationFailed('Invalid email or password')
        
        if not user.has_usable_password:
            raise AuthenticationFailed('This account uses Google login. Please sign in with Google')

        refresh = RefreshToken.for_user(user)

        data.pop("captchaToken", None)
        return {
            "user": user,
            "access": str(refresh.access_token),
            "refresh": str(refresh)
        }

  


class StartChatSerializer(serializers.Serializer):
    email = serializers.EmailField()
    
    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("User not found")
        return value
    


class MessageSerializer(serializers.ModelSerializer):
    sender_id = serializers.UUIDField(source='sender.id', read_only=True)
    sender_image = serializers.URLField(source='sender.image_url', read_only=True)
    sender_firstname = serializers.CharField(source='sender.firstname', read_only=True)
    sender_lastname = serializers.CharField(source='sender.lastname', read_only=True)
    is_read = serializers.SerializerMethodField()
    content = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            'id',
            'chat',
            'sender_id',
            'sender_firstname',
            'sender_lastname',
            'sender_image',
            'content',
            'type',
            'created_at',
            'is_read',
        ]


    def get_content(self, obj):
        if not obj.iv:
            return obj.content

        try:
            return decrypt_message(obj.content, obj.iv)
        except Exception as e:
            print("Decryption failed:", e)
            return None

    
    def get_is_read(self, obj):
        user = self.context['request'].user
        return obj.read_by.filter(id=user.id).exists()
