set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input

python manage.py migrate

python manage.py shell -c "
from django.contrib.auth import get_user_model
import os
User = get_user_model()
email = os.environ.get('SUPERUSER_EMAIL')
user = User.objects.get(email=email)
user.username = 'admin'
user.firstname = 'Admin'
user.lastname = 'Admin'
user.is_staff = True
user.is_superuser = True
user.set_password(os.environ.get('SUPERUSER_PASSWORD'))
user.save()
print('Superuser updated.')
"