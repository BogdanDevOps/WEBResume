import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "WEBresumeBack.settings")
django.setup()

from django.contrib.auth.models import User
from resume.models import Profile

try:
    # Получаем или создаем пользователя
    user = User.objects.first()
    if not user:
        user = User.objects.create_superuser("admin", "admin@example.com", "admin")
        print("Создан новый пользователь admin")
    else:
        print(f"Использован существующий пользователь {user.username}")

    # Обновляем профиль с правильным Telegram ID
    profile, created = Profile.objects.get_or_create(user=user)
    
    # Обновляем данные профиля
    profile.telegram_token = "7426618022:AAF1awnWsXviu22F6AkB6we4GdDFFibuMvI"
    profile.telegram_username = "Bogdan_LegacyForgeSolutions"  # без @
    
    # Сохраняем изменения
    profile.save()
    
    if created:
        print("Создан новый профиль")
    else:
        print("Обновлен существующий профиль")
    
    print(f"Токен: {profile.telegram_token}")
    print(f"Имя пользователя: {profile.telegram_username}")
    
    # Отправляем тестовое сообщение
    import requests
    
    url = f"https://api.telegram.org/bot{profile.telegram_token}/sendMessage"
    data = {
        "chat_id": 755874397,  # Ваш правильный ID
        "text": "Тестовое сообщение. Если вы видите это, значит настройка работает правильно!"
    }
    
    response = requests.post(url, json=data)
    print(f"Результат отправки: {response.status_code}")
    print(f"Ответ: {response.text}")
    
except Exception as e:
    print(f"Ошибка: {e}") 