from django.db import models
from django.contrib.auth.models import User
from django.core.validators import FileExtensionValidator
from django.utils.crypto import get_random_string
from cryptography.fernet import Fernet
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.cache import cache
import base64
import logging

logger = logging.getLogger(__name__)

class EncryptedTextField(models.TextField):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.key = settings.ENCRYPTION_KEY
        self.cipher_suite = Fernet(self.key)

    def get_prep_value(self, value):
        if value is None:
            return value
        try:
            return self.cipher_suite.encrypt(value.encode()).decode()
        except Exception as e:
            # В случае ошибки шифрования, возвращаем исходное значение
            # для разработки (не рекомендуется для продакшн)
            logger.error(f"Encryption error: {e}")
            return value

    def from_db_value(self, value, expression, connection):
        if value is None:
            return value
        try:
            return self.cipher_suite.decrypt(value.encode()).decode()
        except Exception as e:
            # В случае ошибки дешифрования, возвращаем зашифрованное значение
            logger.error(f"Decryption error: {e}")
            return value

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    telegram_token = EncryptedTextField()
    telegram_username = models.CharField(max_length=100)
    resume_pdf = models.FileField(
        upload_to='resumes/',
        validators=[FileExtensionValidator(allowed_extensions=['pdf'])]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"

class Resume(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    
    # Персональная информация
    name = models.CharField(max_length=200)
    location = models.CharField(max_length=200)
    date_of_birth = models.CharField(max_length=100)
    phone = models.CharField(max_length=100)
    email = models.EmailField()
    photo = models.ImageField(upload_to='photos/', blank=True, null=True)
    
    # Основная информация
    about = models.TextField()
    
    # Языки и навыки хранятся как JSON
    languages = models.JSONField(default=list)  # [{"language": "Ukrainian", "level": "Native"}, ...]
    skills = models.JSONField(default=list)     # [{"category": "Programming", "items": ["Java", "Python", ...]}, ...]
    skills_table = models.JSONField(default=list)  # [{"skill": "Java", "level": "8/10"}, ...]
    
    # Опыт работы
    experience = models.JSONField(default=list)  # [{"period": "...", "title": "...", "company": "...", "description": []}, ...]
    
    # Проекты (отдельно от модели Project)
    resume_projects = models.JSONField(default=list)  # [{"name": "...", "description": "...", "technologies": [...], "status": "..."}, ...]
    
    # Отзывы
    testimonials = models.JSONField(default=list)  # [{"name": "...", "position": "...", "company": "...", "text": "...", "rating": 5}, ...]
    
    # Доп. файлы
    video_urls = models.JSONField(default=list)  # ["url1", "url2", ...]
    pdf_files = models.JSONField(default=list)   # [{"name": "file1.pdf", "url": "/media/pdfs/file1.pdf"}, ...]
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name}'s Resume"

class Project(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    image = models.ImageField(upload_to='projects/')
    technologies = models.JSONField(default=list)
    github_url = models.URLField(blank=True, null=True)
    live_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class Message(models.Model):
    sender_name = models.CharField(max_length=100)
    sender_email = models.EmailField()
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"Message from {self.sender_name}"


@receiver(post_save, sender=Resume)
def clear_resume_cache(sender, instance, **kwargs):
    """
    Очистка кеша после сохранения резюме для обеспечения актуальности данных на фронтенде
    """
    try:
        # Очистка всех кешей, связанных с резюме
        cache.delete('resume_data')
        cache.delete_many([f'resume_{instance.id}', 'all_resumes'])
        logger.info(f"Resume cache cleared for resume ID: {instance.id}")
    except Exception as e:
        logger.error(f"Error clearing resume cache: {e}")
