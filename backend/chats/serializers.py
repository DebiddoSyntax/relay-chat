from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.tokens import RefreshToken


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

    class Meta:
        model = User
        fields = [ 'firstname', 'lastname', 'email', 'password', ]

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Email already exists')
        return value

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
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(
            username=data['email'],
            password=data['password']
        )

        if not user:
            raise AuthenticationFailed('Invalid email or password')

        refresh = RefreshToken.for_user(user)

        self.user = user
        self.access_token = str(refresh.access_token)
        self.refresh_token = str(refresh)

        return data