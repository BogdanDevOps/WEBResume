import json
import logging
import traceback
import requests
from django.shortcuts import render, get_object_or_404
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.core.cache import cache
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import Profile, Project, Message, Resume
from .serializers import (
    UserSerializer, ProfileSerializer,
    ProjectSerializer, MessageSerializer, ResumeSerializer
)
from django.conf import settings
from asgiref.sync import sync_to_async
from django.http import JsonResponse, HttpResponse
from django.views.decorators.http import require_http_methods
from django.db.models.signals import post_save
from django.dispatch import receiver

logger = logging.getLogger(__name__)

# Настройки кэширования - отключаем кэш для быстрого обновления данных на фронтенде
RESUME_CACHE_TTL = 1  # Устанавливаем минимальное время кэширования (1 секунда)

# Повышаем уровень логирования для большего вывода
logger.setLevel(logging.DEBUG)

# Добавляем логирование в консоль для отладки
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.DEBUG)
console_formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
console_handler.setFormatter(console_formatter)
logger.addHandler(console_handler)

# Предустановленные настройки Telegram (на случай, если они отсутствуют в settings.py)
TELEGRAM_BOT_TOKEN = "7426618022:AAF1awnWsXviu22F6AkB6we4GdDFFibuMvI"
TELEGRAM_CHAT_ID = 755874397

# Сигнал для автоматической очистки кэша при изменении резюме
@receiver(post_save, sender=Resume)
def clear_resume_cache(sender, instance, **kwargs):
    """
    Очищает кэш при сохранении модели Resume.
    """
    logger.info(f"Автоматическая очистка кэша после изменения резюме ID: {instance.id}")
    cache.clear()

# Инициализация Telegram без вызова ошибки
try:
    # Пытаемся получить настройки из settings.py, если они есть
    bot_token = getattr(settings, 'TELEGRAM_BOT_TOKEN', TELEGRAM_BOT_TOKEN)
    chat_id = getattr(settings, 'TELEGRAM_CHAT_ID', TELEGRAM_CHAT_ID)
    
    logger.info(f"Telegram настройки загружены: токен={bot_token[:5]}..., chat_id={chat_id}")
    
    # Тестовый запрос к API Telegram для проверки настроек
    test_url = f"https://api.telegram.org/bot{bot_token}/getMe"
    logger.info(f"Выполняем тестовый запрос к Telegram API: {test_url}")
    try:
        test_response = requests.get(test_url, timeout=5)
        if test_response.status_code == 200:
            bot_info = test_response.json()
            if bot_info.get('ok'):
                bot_username = bot_info['result'].get('username')
                logger.info(f"✅ Соединение с Telegram успешно! Бот: @{bot_username}")
            else:
                logger.error(f"❌ API Telegram отверг запрос: {bot_info}")
        else:
            logger.error(f"❌ Ошибка соединения с Telegram API: {test_response.status_code}")
    except Exception as e:
        logger.error(f"❌ Не удалось соединиться с Telegram API: {str(e)}")
except Exception as e:
    logger.error(f"❌ Ошибка при инициализации Telegram настроек: {str(e)}")

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        # Разрешаем чтение всем пользователям
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Проверяем кастомный заголовок авторизации
        if 'X-User-Authenticated' in request.headers and request.headers['X-User-Authenticated'] == 'true':
            return True
            
        # Проверяем, авторизован ли пользователь и является ли он администратором
        return request.user and request.user.is_staff

class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Profile.objects.all()
        return Profile.objects.filter(user=self.request.user)

class ResumeViewSet(viewsets.ModelViewSet):
    queryset = Resume.objects.all()
    serializer_class = ResumeSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    def get_permissions(self):
        """
        Чтение разрешено всем, запись только администраторам или через X-User-Authenticated
        """
        if self.action in ['list', 'retrieve', 'latest']:
            return []
        elif self.action in ['update', 'partial_update', 'clear_cache']:
            return []
        return [IsAdminOrReadOnly()]
    
    def get_queryset(self):
        """
        Получение списка резюме, отсортированных по дате обновления
        """
        return Resume.objects.all().order_by('-updated_at')
    
    def perform_create(self, serializer):
        """
        Установка текущего пользователя как владельца при создании резюме
        """
        serializer.save(user=self.request.user)
        
    def retrieve(self, request, *args, **kwargs):
        """
        Кешированное получение одиночного резюме
        """
        resume_id = kwargs.get('pk')
        cache_key = f'resume_{resume_id}'
        
        # Попытка получить данные из кеша
        cached_data = cache.get(cache_key)
        if cached_data:
            logger.info(f"Resume cache hit for ID: {resume_id}")
            return Response(cached_data)
            
        # Если кеша нет, получаем данные из БД
        response = super().retrieve(request, *args, **kwargs)
        
        # Сохраняем в кеш
        cache.set(cache_key, response.data, RESUME_CACHE_TTL)
        logger.info(f"Resume cache set for ID: {resume_id}")
        
        return response
    
    def list(self, request, *args, **kwargs):
        """
        Кешированное получение списка резюме
        """
        cache_key = 'all_resumes'
        
        # Попытка получить данные из кеша
        cached_data = cache.get(cache_key)
        if cached_data:
            logger.info("All resumes cache hit")
            return Response(cached_data)
            
        # Если кеша нет, получаем данные из БД
        response = super().list(request, *args, **kwargs)
        
        # Сохраняем в кеш
        cache.set(cache_key, response.data, RESUME_CACHE_TTL)
        logger.info("All resumes cache set")
        
        return response
    
    @action(detail=False, methods=['get'])
    def latest(self, request):
        """
        Получение последнего (или единственного) резюме
        """
        try:
            # Попытка получить данные из кеша
            cached_data = cache.get('resume_data')
            if cached_data:
                logger.info("Latest resume cache hit")
                return Response(cached_data)
                
            # Если кеша нет, получаем данные из БД
            resume = self.get_queryset().first()
            if not resume:
                return Response({"error": "No resume found"}, status=status.HTTP_404_NOT_FOUND)
                
            serializer = self.get_serializer(resume)
            
            # Сохраняем в кеш
            cache.set('resume_data', serializer.data, RESUME_CACHE_TTL)
            logger.info(f"Latest resume cache set for ID: {resume.id}")
            
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error getting latest resume: {e}")
            logger.error(traceback.format_exc())
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @method_decorator(csrf_exempt)
    def update(self, request, *args, **kwargs):
        """
        Обновление резюме с очисткой кеша
        """
        try:
            # Отключаем проверку прав доступа
            self.permission_classes = []
            
            # Получаем объект резюме
            instance = self.get_object()
            
            # Log the incoming data
            logger.info(f"Received data for update: {request.data}")
            
            # Обновляем объект
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            
            # Очищаем ВСЕ кэши для гарантированного обновления данных на фронтенде
            cache.clear()
            logger.info("Весь кэш был очищен после обновления резюме")
            
            # Return updated data
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error updating resume: {e}")
            logger.error(traceback.format_exc())
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @method_decorator(csrf_exempt)
    @action(detail=False, methods=['post'])
    def clear_cache(self, request):
        """
        Принудительная очистка всех кешей, связанных с резюме
        """
        try:
            cache.delete('resume_data')
            cache.delete('all_resumes')
            
            # Очистка кеша для каждого резюме
            resumes = Resume.objects.all()
            for resume in resumes:
                cache.delete(f'resume_{resume.id}')
                
            logger.info("All resume caches manually cleared")
            return Response({'status': 'success', 'message': 'Кеш резюме очищен'})
        except Exception as e:
            logger.error(f"Error clearing resume cache: {e}")
            return Response(
                {'status': 'error', 'message': f'Ошибка при очистке кеша: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        return Project.objects.all().order_by('-created_at')

class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return []
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Message.objects.all().order_by('-created_at')
        return Message.objects.none()

    def create(self, request, *args, **kwargs):
        """
        Создание сообщения и отправка в Telegram
        """
        import logging
        logger = logging.getLogger(__name__)
        
        logger.info(f"Получен запрос на создание сообщения: {request.data}")
        logger.info(f"Заголовки запроса: {request.headers}")
        
        # Включаем дополнительные заголовки CORS для гарантированного доступа
        response_headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
        
        try:
            # Обработка данных из запроса
            data = request.data
            
            # Если данные не в виде словаря (пришли как строка JSON)
            if not isinstance(data, dict) and hasattr(request, 'body'):
                try:
                    data = json.loads(request.body)
                except Exception as e:
                    logger.error(f"Ошибка парсинга JSON: {e}")
                    return Response(
                        {"error": "Неверный формат данных"}, 
                        status=status.HTTP_400_BAD_REQUEST,
                        headers=response_headers
                    )
            
            # Логируем полученные данные для отладки
            logger.info(f"Подготовленные данные: {data}")
            serializer = self.get_serializer(data=data)
            
            if not serializer.is_valid():
                logger.error(f"Ошибки валидации: {serializer.errors}")
                return Response(
                    {"error": "Ошибка валидации данных", "details": serializer.errors}, 
                    status=status.HTTP_400_BAD_REQUEST,
                    headers=response_headers
                )
            
            # Сохраняем в базу
            message = serializer.save()
            logger.info(f"Сообщение сохранено в базе данных: ID={message.id}")

            # Отправка сообщения в Telegram (без блокировки основного потока)
            try:
                success = send_telegram_message(message)
                if success:
                    logger.info("Сообщение успешно отправлено в Telegram")
                else:
                    logger.error("Ошибка отправки сообщения в Telegram")
            except Exception as tg_error:
                logger.error(f"Ошибка при отправке в Telegram: {tg_error}")
            
            # Возвращаем успешный ответ независимо от результата Telegram
            return Response(
                {"success": True, "message": "Сообщение успешно получено"}, 
                status=status.HTTP_201_CREATED,
                headers=response_headers
            )
            
        except Exception as e:
            logger.error(f"Ошибка при создании сообщения: {e}")
            logger.error(traceback.format_exc())
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST,
                headers=response_headers
            )

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        message = self.get_object()
        message.is_read = True
        message.save()
        return Response({'status': 'message marked as read'})

def send_telegram_message(message, custom_text=None):
    """
    Отправляет сообщение в Telegram бот
    """
    import requests
    from django.conf import settings
    
    logger = logging.getLogger(__name__)
    logger.info(f"Отправка в Telegram: {message}")
    
    try:
        # Используем предустановленные константы, если настройки отсутствуют
        TOKEN = getattr(settings, 'TELEGRAM_BOT_TOKEN', TELEGRAM_BOT_TOKEN)
        TELEGRAM_ID = getattr(settings, 'TELEGRAM_CHAT_ID', TELEGRAM_CHAT_ID)
        
        if custom_text:
            text = custom_text
        else:
            text = f"*Новое сообщение с сайта:*\n\n" \
                f"*От:* {message.sender_name}\n" \
                f"*Email:* {message.sender_email}\n" \
                f"*Сообщение:* {message.message}\n\n" \
                f"*Дата:* {message.created_at.strftime('%Y-%m-%d %H:%M:%S')}"
        
        url = f"https://api.telegram.org/bot{TOKEN}/sendMessage"
        
        logger.info(f"URL для отправки: {url}")
        logger.info(f"Chat ID: {TELEGRAM_ID}")
        
        data = {
            "chat_id": TELEGRAM_ID,
            "text": text,
            "parse_mode": "Markdown"
        }
        
        response = requests.post(url, json=data, timeout=15)
        logger.info(f"Ответ от Telegram API: {response.status_code} {response.text[:100]}")
        
        if response.status_code == 200 and response.json().get('ok'):
            logger.info("Сообщение успешно отправлено в Telegram")
            return True
        else:
            logger.warning(f"Ошибка отправки в Telegram: {response.status_code} {response.text[:100]}")
            
            # Пробуем отправить упрощенное сообщение без Markdown
            logger.info("Пробуем отправить простое сообщение без Markdown")
            simple_text = f"Новое сообщение с сайта от {message.sender_name} ({message.sender_email}): {message.message}"
            simple_data = {
                "chat_id": TELEGRAM_ID,
                "text": simple_text
            }
            
            logger.info("Пробуем отправить простое сообщение без Markdown")
            simple_response = requests.post(url, json=simple_data, timeout=15)
            logger.info(f"Ответ простого сообщения: {simple_response.status_code}")
            
            # Пробуем еще один вариант с username вместо ID
            logger.info("Пробуем отправить сообщение с использованием username")
            username_data = {
                "chat_id": "@Bogdan_LegacyForgeSolutions",  # Используем username с @
                "text": simple_text
            }
            username_response = requests.post(url, json=username_data, timeout=15)
            logger.info(f"Ответ с username: {username_response.status_code}")
            
            return simple_response.status_code == 200 and simple_response.json().get('ok')
    except Exception as e:
        logger.error(f"Ошибка отправки в Telegram: {str(e)}")
        return False

# Authentication views
@api_view(['POST'])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(request, username=username, password=password)
    
    if user is not None:
        login(request, user)
        return Response({'success': True}, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    logout(request)
    return Response({'success': True}, status=status.HTTP_200_OK)

@api_view(['GET'])
def auth_status(request):
    return Response({
        'is_authenticated': request.user.is_authenticated,
        'username': request.user.username if request.user.is_authenticated else None,
        'is_staff': request.user.is_staff if request.user.is_authenticated else False
    })

@csrf_exempt
def send_message(request):
    """
    Простая функция для отправки сообщения в Telegram.
    """
    print(f"Получен запрос: {request.method}")
    
    # Добавляем CORS заголовки для любого ответа
    response_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }
    
    # Обработка preflight OPTIONS запросов
    if request.method == 'OPTIONS':
        print("Обрабатываем OPTIONS запрос")
        response = HttpResponse()
        for key, value in response_headers.items():
            response[key] = value
        return response
    
    if request.method != 'POST':
        print(f"Получен не POST запрос: {request.method}")
        return JsonResponse({
            'success': False,
            'message': 'Только POST запросы поддерживаются'
        }, status=400, headers=response_headers)
    
    try:
        # Получаем данные из запроса
        body = request.body.decode('utf-8')
        print(f"Тело запроса: {body}")
        
        data = json.loads(body)
        print(f"Данные: {data}")
        
        # Получаем поля формы
        sender_name = data.get('sender_name', '')
        sender_email = data.get('sender_email', '')
        message_text = data.get('message', '')
        
        # Проверяем наличие всех полей
        if not all([sender_name, sender_email, message_text]):
            missing = []
            if not sender_name: missing.append('sender_name')
            if not sender_email: missing.append('sender_email')
            if not message_text: missing.append('message')
            
            print(f"Отсутствуют обязательные поля: {missing}")
            return JsonResponse({
                'success': False,
                'message': f'Отсутствуют обязательные поля: {", ".join(missing)}'
            }, status=400, headers=response_headers)
        
        # Формируем текст для отправки в Telegram
        telegram_text = f"📩 Новое сообщение!\n\n👤 От: {sender_name}\n📧 Email: {sender_email}\n\n💬 Сообщение:\n{message_text}"
        
        # Отправляем сообщение в Telegram
        telegram_url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
        telegram_payload = {
            'chat_id': CHAT_ID,
            'text': telegram_text,
        }
        
        print(f"Отправляем запрос в Telegram: {telegram_url}")
        print(f"Данные для Telegram: {telegram_payload}")
        
        # Выполняем запрос к Telegram API
        response = requests.post(telegram_url, json=telegram_payload, timeout=10)
        
        print(f"Статус ответа Telegram: {response.status_code}")
        print(f"Ответ Telegram: {response.text}")
        
        # Проверяем успешность отправки
        if response.status_code == 200:
            telegram_data = response.json()
            if telegram_data.get('ok'):
                print("Сообщение успешно отправлено в Telegram!")
                return JsonResponse({
                    'success': True,
                    'message': 'Сообщение успешно отправлено в Telegram!'
                }, headers=response_headers)
        
        # Если дошли сюда, значит была ошибка
        print(f"Ошибка при отправке в Telegram: {response.text}")
        return JsonResponse({
            'success': False,
            'message': f'Ошибка при отправке в Telegram: {response.text}'
        }, status=500, headers=response_headers)
        
    except json.JSONDecodeError as e:
        print(f"Ошибка при парсинге JSON: {e}")
        return JsonResponse({
            'success': False,
            'message': f'Неверный формат данных: {str(e)}'
        }, status=400, headers=response_headers)
        
    except requests.RequestException as e:
        print(f"Ошибка при отправке запроса в Telegram: {e}")
        return JsonResponse({
            'success': False,
            'message': f'Ошибка при отправке запроса в Telegram: {str(e)}'
        }, status=500, headers=response_headers)
        
    except Exception as e:
        print(f"Непредвиденная ошибка: {e}")
        traceback.print_exc()
        return JsonResponse({
            'success': False,
            'message': f'Непредвиденная ошибка: {str(e)}'
        }, status=500, headers=response_headers)

def simple_form(request):
    """
    Простая форма для тестирования отправки сообщений
    """
    return render(request, 'simple_form.html')

def button_test(request):
    """
    Отображение тестовой страницы с разными типами кнопок
    """
    return render(request, 'button_test.html')
