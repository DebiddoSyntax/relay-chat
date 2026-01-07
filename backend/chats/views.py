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



User = get_user_model()


# start chat
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_chat_view(request):
    sender = request.user
    receiver_email = request.data.get('receiver')

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

    if sender.id == receiver.id:
        return Response(
            {"detail": "You cannot start a chat with yourself"},
            status=status.HTTP_400_BAD_REQUEST
        )

    chat = Chat.objects.filter(
        is_group=False,
        users=sender
    ).filter(
        users=receiver
    ).distinct().first()

    if not chat:
        chat_name = f"{receiver.first_name} {receiver.last_name}".strip()

        chat = Chat.objects.create(
            is_group=False,
            name=chat_name
        )

        UserChat.objects.bulk_create([
            UserChat(user=sender, chat=chat),
            UserChat(user=receiver, chat=chat),
        ])


    return Response(
        {
            "chat_id": chat.id,
            "chat_name": chat.name,
            "last_message": chat.last_message.content if chat.last_message else None,
            "last_message_time": chat.last_message.created_at if chat.last_message else None,
        },
        status=status.HTTP_200_OK
    )


# get private chats
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_chat_view(request):
    user = request.user

    chats = Chat.objects.filter(is_group=False, users=user)

    if not chats.exists():
        return Response(
            {"detail": "No chats found"},
            status=status.HTTP_404_NOT_FOUND
        )

    data = [
        {
            "chat_id": chat.id,
            "chat_name": chat.name,
            "last_message": chat.last_message.content if chat.last_message else None,
            "last_message_time": chat.last_message.created_at if chat.last_message else None,
        }
        for chat in chats
    ]


    return Response(data, status=status.HTTP_200_OK)



# get private chat messages
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

    # 5. Mark messages as read (only paginated ones)
    unread_messages = (
        Message.objects
        .filter(id__in=[msg.id for msg in page])
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

    return response



# Refresh view 
@api_view(["POST"])
@permission_classes([AllowAny])
def refresh_token_view(request):
    # refresh_token = request.COOKIES.get("refreshToken")
    refresh_token = request.data.get("refreshToken")

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

        return response

    except Exception:
        print('Invalid or expired refresh token')
        return Response(
            {"message": "Invalid or expired refresh token"},
            status=status.HTTP_401_UNAUTHORIZED
        )