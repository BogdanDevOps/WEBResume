"""
URL configuration for WEBresumeBack project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from rest_framework import routers
from resume.views import MessageViewSet
from simple_handler import send_message  # Импортируем из простого обработчика

# Импортируем обработчик чат-бота с проверкой доступности
try:
    from chatbot_api import chat_message
    CHATBOT_AVAILABLE = True
except ImportError:
    # Создаем заглушку для обработчика
    from django.http import JsonResponse
    def chat_message(request):
        return JsonResponse({
            'success': False, 
            'message': 'Chat API is not available. Please ask administrator to install required dependencies.'
        }, status=503)
    CHATBOT_AVAILABLE = False
    print("WARNING: Chatbot API is not available. Using fallback handler.")

# Создаем роутер для API
direct_router = routers.DefaultRouter()
direct_router.register(r'messages', MessageViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('resume.urls')),
    path('', include(direct_router.urls)),  # Прямой доступ к messages через /messages/
    path('send-message/', send_message, name='send_message'),  # Простой URL для отправки сообщений
    path('chat-message/', chat_message, name='chat_message'),  # URL для обработки запросов от чат-бота
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
