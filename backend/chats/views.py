from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import SignupSerializer, LoginSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny



User = get_user_model()


# Create your views here.
@api_view(['GET'])
def chats(request):
    content = { 'name': "David" }
    return Response(content, status=status.HTTP_200_OK)


# Signup view
@csrf_exempt
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
            'user': send_user
        },
        status=status.HTTP_200_OK
    )

    response.set_cookie(
        key='refreshToken',
        value=refreshToken,
        httponly=True,
        secure=False,
        samesite='Lax',
        max_age=60 * 60 * 24 * 30,
        path='/'
    )

    return response


# Login view
@csrf_exempt
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
        samesite='Lax',
        max_age=60 * 60 * 24 * 30,
        path='/'
    )

    return response

