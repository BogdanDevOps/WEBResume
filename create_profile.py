import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'WEBresumeBack.settings')
django.setup()

from django.contrib.auth.models import User
from resume.models import Profile

# Получаем или создаем пользователя
user = User.objects.first()
if not user:
    user = User.objects.create_superuser('admin', 'admin@example.com', 'admin')
    print("Создан новый пользователь admin")
else:
    print(f"Использован существующий пользователь {user.username}")

# Создаем профиль с Telegram данными
try:
    profile, created = Profile.objects.get_or_create(
        user=user,
        defaults={
            'telegram_token': '7426618022:AAF1awnWsXviu22F6AkB6we4GdDFFibuMvI',
            'telegram_username': '@Bogdan_LegacyForgeSolutions'
        }
    )

    if created:
        print("Создан новый профиль")
    else:
        # Обновляем данные профиля
        profile.telegram_token = '7426618022:AAF1awnWsXviu22F6AkB6we4GdDFFibuMvI'
        profile.telegram_username = '@Bogdan_LegacyForgeSolutions'
        profile.save()
        print("Обновлен существующий профиль")

    print(f"Токен: {profile.telegram_token}")
    print(f"Имя пользователя: {profile.telegram_username}")
except Exception as e:
    print(f"Ошибка: {e}") 