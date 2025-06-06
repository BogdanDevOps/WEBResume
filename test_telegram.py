import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'WEBresumeBack.settings')
django.setup()

import telegram
from resume.models import Profile

def test_send_message():
    try:
        profile = Profile.objects.first()
        if not profile:
            print("Профиль не найден. Сначала создайте профиль.")
            sys.exit(1)
        
        print(f"Найден профиль: {profile}")
        print(f"Токен: {profile.telegram_token}")
        print(f"Имя пользователя: {profile.telegram_username}")
        
        bot = telegram.Bot(token=profile.telegram_token)
        
        # Удаляем символ @ из имени пользователя, если он есть
        username = profile.telegram_username
        if username.startswith('@'):
            username = username[1:]
        
        print(f"Отправка сообщения для {username}...")
        
        # Метод 1: отправка по username без @
        try:
            bot.send_message(
                chat_id=username,
                text=f"Тестовое сообщение - метод 1 (без @)"
            )
            print("Метод 1 успешно!")
        except Exception as e1:
            print(f"Ошибка метода 1: {e1}")
        
        # Метод 2: отправка по username с @
        try:
            bot.send_message(
                chat_id="@" + username,
                text=f"Тестовое сообщение - метод 2 (с @)"
            )
            print("Метод 2 успешно!")
        except Exception as e2:
            print(f"Ошибка метода 2: {e2}")
        
        # Метод 3: отправка через ID чата
        try:
            # Тут нужно использовать ID вашего чата с ботом
            # Обычно это числовое значение, которое можно получить отправив сообщение боту
            # и сделав API запрос getUpdates
            bot.send_message(
                chat_id=1234567890,  # замените на свой ID чата
                text=f"Тестовое сообщение - метод 3 (через ID чата)"
            )
            print("Метод 3 успешно!")
        except Exception as e3:
            print(f"Ошибка метода 3: {e3}")
            
    except Exception as e:
        print(f"Общая ошибка: {e}")

if __name__ == "__main__":
    test_send_message() 