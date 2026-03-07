from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
class AuthRateLimit(UserRateThrottle):
    scope = 'authLimit'