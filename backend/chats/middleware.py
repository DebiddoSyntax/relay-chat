from channels.middleware import BaseMiddleware
from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        scope['user'] = AnonymousUser()
        headers = dict(scope.get("headers", []))
        cookie_header = headers.get(b"cookie", b"").decode()
        
        # Get token
        token = self._extract_token_from_cookies(cookie_header)
        
        if token:
            user, error = await self.get_user(token)
            if user:
                scope['user'] = user
            else:
                scope['auth_error'] = error
        else:
            scope['auth_error'] = 'no_token'

        return await super().__call__(scope, receive, send)
    
    def _extract_token_from_cookies(self, cookie_header):
        if not cookie_header:
            return None
        
        cookies = {}
        for cookie in cookie_header.split(';'):
            cookie = cookie.strip()
            if '=' in cookie:
                key, value = cookie.split('=', 1)
                cookies[key.strip()] = value.strip()
        
        return cookies.get('accessToken')
    
    @database_sync_to_async
    def get_user(self, token):
        try:
            validated_token = AccessToken(token)
            user_id = validated_token['user_id']
            
            from django.contrib.auth import get_user_model
            User = get_user_model()
            return User.objects.get(id=user_id), None
            
        except (InvalidToken, TokenError) as e:
            if 'expired' in str(e).lower():
                return None, 'token_expired'
            return None, 'invalid_token'
        except Exception as e:
            print(f"❌ Error getting user: {e}")
            return None, 'server_error'