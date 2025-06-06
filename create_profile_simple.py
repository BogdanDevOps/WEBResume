import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'WEBresumeBack.settings')
django.setup()

from django.contrib.auth.models import User
from resume.models import Profile

# Создаем суперпользователя, если его нет
try:
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser('admin', 'admin@example.com', 'admin')
        print("Создан пользователь admin")
    else:
        print("Пользователь admin уже существует")
except Exception as e:
    print(f"Ошибка при создании пользователя: {e}")

# Создаем или обновляем профиль
try:
    user = User.objects.get(username='admin')
    profile, created = Profile.objects.get_or_create(user=user)
    
    # Обновляем данные профиля
    profile.telegram_token = '7426618022:AAF1awnWsXviu22F6AkB6we4GdDFFibuMvI'
    profile.telegram_username = 'Bogdan_LegacyForgeSolutions'  # без @
    profile.save()
    
    if created:
        print("Создан новый профиль")
    else:
        print("Обновлен существующий профиль")
        
    print(f"Токен: {profile.telegram_token}")
    print(f"Имя пользователя: {profile.telegram_username}")
except Exception as e:
    print(f"Ошибка при создании профиля: {e}") 