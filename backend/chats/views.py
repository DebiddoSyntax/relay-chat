from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import SignupSerializer, LoginSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from .models import Chat, UserChat
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from django.shortcuts import get_object_or_404

from .models import Message, Chat, MessageReadBy
from .serializers import MessageSerializer
from .pagination import MessageCursorPagination
from django.utils import timezone
from django.db.models import Q, Count
from .utils.decrypt import decrypt_message
import os
from imagekitio import ImageKit




User = get_user_model()

imagekit = ImageKit(
    private_key=os.environ.get("IMAGEKIT_PRIVATE_KEY")
)


# image auth view 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def image_auth(request):
    auth_params = imagekit.helper.get_authentication_parameters()
    
    return Response({
        'token': auth_params['token'],
        'expire': auth_params['expire'],
        'signature': auth_params['signature'],
        'publicKey': os.environ.get('IMAGEKIT_PUBLIC_KEY')
    })



# ai chat 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ai_chat_view(request):
    user = request.user
    ai_user = User.objects.get(email="ai@system.local")

    # Try to get the AI chat
    chat = (
        Chat.objects
        .filter(is_group=False, is_ai=True, users=user)
        .filter(users=ai_user)
        .distinct()
        .first()
    )

    # If chat does not exist, create it
    if not chat:
        chat = Chat.objects.create(is_group=False, is_ai=True)
        UserChat.objects.bulk_create([
            UserChat(user=user, chat=chat),
            UserChat(user=ai_user, chat=chat),
        ])

    # Annotate unread count
    chat.unread_count = (
        Message.objects
        .filter(chat=chat)
        .exclude(sender=user)
        .exclude(
            id__in=MessageReadBy.objects.filter(user=user).values("message_id")
        )
        .count()
    )

    # Prepare response
    data = {
        "chat_id": chat.id,
        "users": [
            {
                "id": u.id,
                "firstname": u.firstname,
                "lastname": u.lastname,
                "email": u.email,
            }
            for u in chat.users.all()
        ],
        "last_message": (
            decrypt_message(chat.last_message.content, chat.last_message.iv)
            if chat.last_message and chat.last_message.iv
            else chat.last_message.content if chat.last_message else None
        ),
        "last_message_time": chat.last_message.created_at if chat.last_message else None,
        "unread_count": chat.unread_count,
    }

    return Response(data, status=status.HTTP_200_OK)



# get chat messages
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def chat_message_list_view(request, chat_id):
 
    chat = get_object_or_404(Chat, id=chat_id)

   
    if not chat.users.filter(id=request.user.id).exists():
        return Response([], status=403)

    
    queryset = (
        Message.objects
        .filter(chat=chat)
        .select_related('sender')
        .prefetch_related('read_by')
    )

    # 4. Paginate manually
    paginator = MessageCursorPagination()
    page = paginator.paginate_queryset(queryset, request)

    serializer = MessageSerializer(
        page,
        many=True,
        context={'request': request}
    )


    unread_messages = (
        Message.objects
        .filter(chat=chat)
        .exclude(sender=request.user)
        .exclude(read_by=request.user)
    )


    MessageReadBy.objects.bulk_create(
        [
            MessageReadBy(message=msg, user=request.user)
            for msg in unread_messages
        ],
        ignore_conflicts=True
    )

    # 6. Return paginated response
    return paginator.get_paginated_response(serializer.data)



# start private chat
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_chat_view(request):
    sender = request.user
    request_email = request.data.get('receiver')
    content = request.data.get('firstMessage')

    receiver_email = request_email.lower() if request_email else None

    if not receiver_email:
        return Response(
            {"detail": "Receiver email is required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not content:
        return Response(
            {"detail": "Message content cannot be empty"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if len(content) > 10000:  # Max message length
        return Response(
            {"detail": "Message is too long (max 10000 characters)"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        receiver = User.objects.get(email=receiver_email)
    except User.DoesNotExist:
        return Response(
            {"detail": "User with this email does not exist"},
            status=status.HTTP_404_NOT_FOUND
        )

    if sender.id == receiver.id:
        return Response(
            {"detail": "You cannot start a chat with yourself"},
            status=status.HTTP_400_BAD_REQUEST
        )

    chat = Chat.objects.filter(is_group=False, users=sender).filter(users=receiver).distinct().first()

    if chat:
        return Response(
            {"detail": f"You already have a chat with {receiver.firstname} {receiver.lastname}"},
            status=status.HTTP_400_BAD_REQUEST
        )
        
    chat = Chat.objects.create(is_group=False, is_ai=False,)

    UserChat.objects.bulk_create([
        UserChat(user=sender, chat=chat),
        UserChat(user=receiver, chat=chat),
    ])

    message = Message.objects.create(
        chat=chat,
        sender=sender,
        content=content,
        type='text'
    )
    
    # Update chat's last message and timestamp
    chat.last_message = message
    chat.updated_at = timezone.now()
    chat.save(update_fields=['last_message', 'updated_at'])


    return Response(
        {
            "chat_id": chat.id,
            "users": [
                {
                    "id": u.id,
                    "firstname": u.firstname,
                    "lastname": u.lastname,
                    "email": u.email,
                    "image_url": u.image_url,
                }
                for u in chat.users.all()
            ],
            "last_message": (
                decrypt_message(chat.last_message.content, chat.last_message.iv)
                if chat.last_message and chat.last_message.iv
                else chat.last_message.content if chat.last_message else None
            ),
            "last_message_time": chat.last_message.created_at if chat.last_message else None,
        },
        status=status.HTTP_200_OK
    )




# get private chats
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_chat_view(request):
    user = request.user

    chats = (
        Chat.objects
        .filter(is_group=False, is_ai=False, users=user)
        .annotate(
            unread_count=Count(
                "messages",
                filter=~Q(messages__sender=user)
                    & ~Q(
                        messages__id__in=MessageReadBy.objects.filter(
                            user=user
                        ).values("message_id")
                    )
            )
        )
    )

    if not chats.exists():
        return Response(
            {"detail": "No chats found"},
            status=status.HTTP_404_NOT_FOUND
        )

    data = [
        {
            "chat_id": chat.id,
            "users": [
                {
                    "id": u.id,
                    "firstname": u.firstname,
                    "lastname": u.lastname,
                    "email": u.email,
                    "image_url": u.image_url,
                }
                for u in chat.users.all()
            ],
            "last_message": (
                decrypt_message(chat.last_message.content, chat.last_message.iv)
                if chat.last_message and chat.last_message.iv
                else chat.last_message.content if chat.last_message else None
            ),
            "last_message_time": chat.last_message.created_at if chat.last_message else None,
            "unread_count": chat.unread_count,
        }
        for chat in chats
    ]


    return Response(data, status=status.HTTP_200_OK)


# start group chat
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_groupchat_view(request):
    sender = request.user
    request_email = request.data.get('receiver')
    content = request.data.get('firstMessage').strip()
    group_name = request.data.get('groupName').strip()

    receiver_email = request_email.lower() if request_email else None

    if not receiver_email:
        return Response(
            {"detail": "Receiver email is required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not content:
        return Response(
            {"detail": "Message content cannot be empty"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if len(content) > 10000:  # Max message length
        return Response(
            {"detail": "Message is too long (max 10000 characters)"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not group_name:
        return Response(
            {"detail": "Group name not provided"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        receiver = User.objects.get(email=receiver_email)
    except User.DoesNotExist:
        return Response(
            {"detail": "User with this email does not exist"},
            status=status.HTTP_404_NOT_FOUND
        )

    if sender.id == receiver.id:
        return Response(
            {"detail": "You cannot start a chat with yourself"},
            status=status.HTTP_400_BAD_REQUEST
        )

    
    chat_name = f"{group_name}".strip()

    chat = Chat.objects.create(
        is_group=True,
        name=chat_name
    )

    UserChat.objects.bulk_create([
        UserChat(user=sender, chat=chat, role='admin'),
        UserChat(user=receiver, chat=chat),
    ])

    user_chat = UserChat.objects.filter(chat=chat, user=request.user).first()

    message = Message.objects.create(
        chat=chat,
        sender=sender,
        content=content,
        type='text'
    )
    
    # Update chat's last message and timestamp
    chat.last_message = message
    chat.updated_at = timezone.now()
    chat.save(update_fields=['last_message', 'updated_at'])


    return Response(
        {
            "chat_id": chat.id,
            "chat_name": chat.name,
            "image_url": chat.image_url,
            "my_role": user_chat.role or '',
            "last_message": (
                decrypt_message(chat.last_message.content, chat.last_message.iv)
                if chat.last_message and chat.last_message.iv
                else chat.last_message.content if chat.last_message else None
            ),
            "last_message_time": chat.last_message.created_at if chat.last_message else None,
        },
        status=status.HTTP_200_OK
    )


# get group chats
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_groupchat_view(request):
    user = request.user

    chats = (
        Chat.objects
        .filter(is_group=True, users=user)
        .annotate(
            unread_count=Count(
                "messages",
                filter=~Q(messages__sender=user)
                    & ~Q(
                        messages__id__in=MessageReadBy.objects.filter(
                            user=user
                        ).values("message_id")
                    )
            )
        )
    )

    if not chats.exists():
        return Response(
            {"detail": "No chats found"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    user_chats = UserChat.objects.filter(user=user, chat__in=chats).select_related('chat')
    chat_roles = {uc.chat.id: uc.role for uc in user_chats}

    data = [
        {
            "chat_id": chat.id,
            "chat_name": chat.name,
            "image_url": chat.image_url,
            "my_role": chat_roles.get(chat.id, "member"),
            "last_message": (
                decrypt_message(chat.last_message.content, chat.last_message.iv)
                if chat.last_message and chat.last_message.iv
                else chat.last_message.content if chat.last_message else None
            ),
            "last_message_time": chat.last_message.created_at if chat.last_message else None,
            "unread_count": chat.unread_count,
        }
        for chat in chats
    ]


    return Response(data, status=status.HTTP_200_OK)


# join group chat
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_groupchat_view(request):
    user = request.user
    request_group_id = request.data.get('groupId')
    group_id = request.data.get('groupId').strip()

    if not group_id:
        return Response(
            {"detail": "Group id not provided"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        chat = Chat.objects.get(id=group_id, is_group=True)
    except Chat.DoesNotExist:
        return Response(
            {"detail": "Chat with this id does not exist"},
            status=status.HTTP_404_NOT_FOUND
        )

    chat.users.add(user)


    return Response(
        {
            "chat_id": chat.id,
            "chat_name": chat.name,
            "image_url": chat.image_url,
            "last_message": (
                decrypt_message(chat.last_message.content, chat.last_message.iv)
                if chat.last_message and chat.last_message.iv
                else chat.last_message.content if chat.last_message else None
            ),
            "last_message_time": chat.last_message.created_at if chat.last_message else None,
        },
        status=status.HTTP_200_OK
    )


# add new member to group chat
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def addmember_groupchat_view(request):
    requester = request.user
    group_id = request.data.get('groupId')
    receiver_email = request.data.get('receiver')

    if not group_id:
        return Response(
            {"detail": "Group id not provided"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not receiver_email:
        return Response(
            {"detail": "Receiver email is required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        receiver = User.objects.get(email=receiver_email)
    except User.DoesNotExist:
        return Response(
            {"detail": "User with this email does not exist"},
            status=status.HTTP_404_NOT_FOUND
        )

    try:
        chat = Chat.objects.get(id=group_id, is_group=True)
    except Chat.DoesNotExist:
        return Response(
            {"detail": "Chat with this id does not exist"},
            status=status.HTTP_404_NOT_FOUND
        )

    if requester not in chat.users.all():
        return Response(
            {"detail": "You are not allowed to add members to this group"},
            status=status.HTTP_403_FORBIDDEN
        )

    chat.users.add(receiver)


    return Response(
        {
            "id": receiver.id,
            "email": receiver.email
        },
        status=status.HTTP_200_OK
    )



# view members of group chat
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def viewmember_groupchat_view(request, chat_id):

    chat = get_object_or_404(Chat, id=chat_id)

    if not chat.users.filter(id=request.user.id).exists():
        return Response(
            {"detail": "You are not allowed to view the members of this group"},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        chat = Chat.objects.get(id=chat_id, is_group=True)
    except Chat.DoesNotExist:
        return Response(
            {"detail": "Chat does not exist"},
            status=status.HTTP_404_NOT_FOUND
        )

    if request.user not in chat.users.all():
        return Response(
            {"detail": "You are not allowed to view members to this group"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    members = UserChat.objects.filter(chat=chat).select_related('user')

    return Response(
        [
            {
                "id": m.user.id,
                "email": m.user.email,
                "role": m.role,
            }
            for m in members
        ],
        status=status.HTTP_200_OK
    )



# change group image view 
@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_groupImage_view(request):
    data = request.data

    chat_id = data.get("chat_id")
    image_url = data.get("image_url")

    chat = get_object_or_404(Chat, id=chat_id)

    if not chat.users.filter(id=request.user.id).exists():
        return Response(
            {"detail": "You are not allowed to change the image of this group"},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        chat = Chat.objects.get(id=chat_id, is_group=True)
    except Chat.DoesNotExist:
        return Response(
            {"detail": "Chat does not exist"},
            status=status.HTTP_404_NOT_FOUND
        )

    if image_url is not None:
        chat.image_url = image_url

    chat.save()

    return Response(
        {
            "detail": "Image uploaded",
            "image_url": chat.image_url,
            "chat_id": chat.id,
        },
        status=status.HTTP_200_OK
    )



# delete group view 
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_group_view(request, chat_id):

    chat = get_object_or_404(Chat, id=chat_id)

    if not chat.is_group:
        return Response(
            {"detail": "This chat is not a group"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not chat.users.filter(id=request.user.id).exists():
        return Response(
            {"detail": "You are not allowed to delete this group"},
            status=status.HTTP_403_FORBIDDEN
        )

    user_chat = UserChat.objects.filter(chat=chat, user=request.user).first()
    
    if not user_chat or user_chat.role != 'admin':
        return Response(
            {"detail": "You are not allowed to delete this group"},
            status=status.HTTP_403_FORBIDDEN
        )


    chat.delete()

    return Response(
        {
            "detail": "Group deleted",
            "chat_id": chat_id,
        },
        status=status.HTTP_200_OK
    )




# Signup view
@api_view(['POST'])
@permission_classes([AllowAny])
def signup_view(request):
    serializer = SignupSerializer(data=request.data)

    if not serializer.is_valid():
        errors = serializer.errors

        field_name = list(errors.keys())[0]
        message = errors[field_name][0]

        return Response(
            {"message": message},
            status=status.HTTP_400_BAD_REQUEST
        )

    data = serializer.save()

    accessToken = data['accessToken']
    refreshToken = data['refreshToken']
    user = data['user']

    send_user = {
        'id': user.id,
        'email': user.email,
        'firstname': user.firstname,
        'lastname': user.lastname,
        "image_url": user.image_url,

    }

    response = Response(
        {
            'accessToken': accessToken,
            'refreshToken': refreshToken,
            'user': send_user
        },
        status=status.HTTP_200_OK
    )

    response.set_cookie(
        key='refreshToken',
        value=refreshToken,
        httponly=True,
        secure=False,
        samesite="Lax",
        max_age=60 * 60 * 24 * 30,
        path='/'
    )

    response.set_cookie(
        key='accessToken',
        value=accessToken,
        httponly=True,
        secure=False,
        samesite="Lax",
        max_age=60 * 60 * 24 * 30,
        path='/'
    )

    return response



# Login view
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)


    serializer.is_valid(raise_exception=True)

    user = serializer.user
    accessToken = serializer.access_token
    refreshToken = serializer.refresh_token

    response = Response(
        {
            'accessToken': accessToken,
            'refreshToken': refreshToken,
            'user': {
                'id': user.id,
                'email': user.email,
                'firstname': user.firstname,
                'lastname': user.lastname,
                "image_url": user.image_url,
            }
        },
        status=status.HTTP_200_OK
    )

    response.set_cookie(
        key='refreshToken',
        value=refreshToken,
        httponly=True,
        secure=False,
        samesite="Lax",
        max_age=60 * 60 * 24 * 30,
        path='/'
    )

    response.set_cookie(
        key='accessToken',
        value=accessToken,
        httponly=True,
        secure=False,
        samesite="Lax",
        max_age=60 * 60 * 24 * 30,
        path='/'
    )

    return response



# Refresh view 
@api_view(["POST"])
@permission_classes([AllowAny])
def refresh_token_view(request):
    refresh_token = request.COOKIES.get("refreshToken")
    print('request:', request)
    # refresh_token = request.data.get("refreshToken")

    if not refresh_token:
        print('Refresh token not provided')
        return Response(
            {"message": "Refresh token not provided"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    try:
        refresh = RefreshToken(refresh_token)

        new_access_token = str(refresh.access_token)

        response = Response(
            {
                "accessToken": new_access_token
            },
            status=status.HTTP_200_OK
        )


        if settings.SIMPLE_JWT.get("ROTATE_REFRESH_TOKENS"):
            new_refresh_token = str(refresh)
            response.set_cookie(
                key="refreshToken",
                value=new_refresh_token,
                httponly=True,
                secure=False,  
                samesite="Lax",
                max_age=60 * 60 * 24 * 30,
                path="/"
            )

            response.set_cookie(
                key='accessToken',
                value=new_access_token,
                httponly=True,
                secure=False,
                samesite="Lax",
                max_age=60 * 60 * 24 * 30,
                path='/'
            )

        return response

    except Exception:
        print('Invalid or expired refresh token')
        return Response(
            {"message": "Invalid or expired refresh token"},
            status=status.HTTP_401_UNAUTHORIZED
        )




# change pass view 
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_pass_view(request):
    data = request.data
    user = request.user

    required_fields = ["password", "newPassword"]
    missing = [f for f in required_fields if not data.get(f)]

    if missing:
        return Response(
            {"detail": f"Missing required fields: {', '.join(missing)}"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not user.check_password(data["password"]):
        return Response(
            {"detail": "Current password is incorrect"},
            status=status.HTTP_400_BAD_REQUEST
        )

    user.set_password(data["newPassword"])
    user.save()

    return Response(
        {"detail": "Password changed successfully"},
        status=status.HTTP_200_OK
    )



# change profile details view 
@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_profile_view(request):
    user = request.user
    data = request.data

    firstname = data.get("firstname")
    lastname = data.get("lastname")
    request_email = data.get("email")
    image_url = data.get("image_url")

    email = request_email.lower() if request_email else None

    if email and User.objects.exclude(id=user.id).filter(email=email).exists():
        return Response(
            {"detail": "Email is already in use"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if firstname:
        user.firstname = firstname

    if lastname:
        user.lastname = lastname

    if email:
        user.email = email

    if image_url:
        user.image_url = image_url

    user.save()

    return Response(
        {
            "detail": "Profile updated successfully",
            "user": {
                "id": user.id,
                "firstname": user.firstname,
                "lastname": user.lastname,
                "email": user.email,
                "image_url": user.image_url,
            }
        },
        status=status.HTTP_200_OK
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    response = Response(
        {"message": "Logged out successfully"},
        status=status.HTTP_200_OK
    )

    # Delete cookies by setting them to empty and expired
    response.delete_cookie('accessToken', path='/')
    response.delete_cookie('refreshToken', path='/')

    return response