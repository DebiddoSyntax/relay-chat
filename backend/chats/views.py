from django.contrib.auth import authenticate, login
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import json



# Create your views here.

User = get_user_model()

@api_view(['GET'])
def chats(request):
    content = { 'name': "David" }
    return Response(content, status=status.HTTP_200_OK)


@api_view(['POST'])
def signup_view(request):
    data = request.data

    required_fields = [
        'firstname', 'lastname', 'email', 'password', 
    ]

    missing_fields = [field for field in required_fields if not data.get(field)]

    if missing_fields:
        return Response({
            'detail': f'Missing required fields: {", ".join(missing_fields)}'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Check if user exists
    email = data['email'].lower().strip()
    if User.objects.filter(email=email).exists():
        return Response({'message': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)


    print("signup data", request.data)

    # Create user
    # try:
    #     user = User.objects.create_user(
    #         email=email,
    #         firstname=data['firstname'],
    #         lastname=data['lastname'],
    #         password=data['password'],
    #     )
    # except Exception as e:
    #     print(f"Error creating user: {e}")
    #     return Response({'message': 'Failed to create user'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    # Token generation
    # refresh = RefreshToken.for_user(user)
    # access = str(refresh.access_token)
    # refresh = str(refresh)

    # login(request, user)

    return Response({
        'message': 'User created successfully',
        # 'token': {
        #     'access': access,
        #     'refresh': refresh
        # },
        # 'user': user,
        # 'user': CustomUserSerializer(user).data,
    }, status=status.HTTP_201_CREATED)

