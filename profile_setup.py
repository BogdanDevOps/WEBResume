import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "WEBresumeBack.settings")
django.setup()

from django.contrib.auth.models import User
from resume.models import Profile

try:
    user = User.objects.get(username="admin")
    print("Пользователь admin существует")
except User.DoesNotExist:
    user = User.objects.create_superuser("admin", "admin@example.com", "admin")
    print("Создан пользователь admin")

try:
    profile, created = Profile.objects.get_or_create(user=user)
    profile.telegram_token = "7426618022:AAF1awnWsXviu22F6AkB6we4GdDFFibuMvI"
    profile.telegram_username = "Bogdan_LegacyForgeSolutions"
    profile.save()
    print("Профиль сохранен")
    print(f"Имя пользователя: {profile.telegram_username}")
except Exception as e:
    print(f"Ошибка: {e}") 