set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input

python manage.py migrate

python manage.py shell -c "
from django.contrib.auth import get_user_model
import os
User = get_user_model()
if not User.objects.filter(email=os.environ.get('SUPERUSER_EMAIL')).exists():
    User.objects.create_superuser(email=os.environ.get('SUPERUSER_EMAIL'), password=os.environ.get('SUPERUSER_PASSWORD'))
print('Superuser ready.')
"