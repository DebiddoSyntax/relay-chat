# from urllib.parse import parse_qs
# from channels.middleware import BaseMiddleware
# from channels.db import database_sync_to_async

# class JWTAuthMiddleware(BaseMiddleware):
#     async def __call__(self, scope, receive, send):
#         from django.contrib.auth.models import AnonymousUser
#         scope['user'] = AnonymousUser()


#         query_string = scope.get('query_string', b'').decode()
#         params = parse_qs(query_string)
#         token_list = params.get('token')

#         if token_list:
#             token = token_list[0]
#             user = await self.get_user(token)
#             if user:
#                 scope['user'] = user

#         return await super().__call__(scope, receive, send)

#     @database_sync_to_async
#     def get_user(self, token):
#         from rest_framework_simplejwt.authentication import JWTAuthentication

#         try:
#             jwt_auth = JWTAuthentication()
#             validated_token = jwt_auth.get_validated_token(token)
#             return jwt_auth.get_user(validated_token)
#         except Exception:
#             return None

from urllib.parse import parse_qs
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import TokenError


class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        scope["user"] = AnonymousUser()
        scope["close_code"] = None

        query_string = scope.get("query_string", b"").decode()
        params = parse_qs(query_string)
        token_list = params.get("token")

        # No token provided
        if not token_list:
            scope["close_code"] = 4002
            return await super().__call__(scope, receive, send)

        token = token_list[0]
        result = await self.get_user_from_token(token)

        # Token failed validation
        if isinstance(result, dict):
            scope["close_code"] = result["code"]
            return await super().__call__(scope, receive, send)

        # Auth success
        scope["user"] = result
        return await super().__call__(scope, receive, send)

    @database_sync_to_async
    def get_user_from_token(self, token):
        jwt_auth = JWTAuthentication()

        try:
            validated_token = jwt_auth.get_validated_token(token)
            user = jwt_auth.get_user(validated_token)
            return user

        except TokenError as e:
            message = str(e).lower()

            if "expired" in message:
                return {"code": 4001}  # access token expired

            return {"code": 4003}      # invalid token

