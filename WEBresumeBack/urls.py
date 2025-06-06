"""
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
from rest_framework.routers import DefaultRouter
from resume.views import MessageViewSet
from simple_handler import send_message

# Для прямого доступа к сообщениям без prefix 'api/'
message_router = DefaultRouter()
message_router.register(r'messages', MessageViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    # API маршруты с префиксом 'api/'
    path('api/', include([
        path('', include('resume.urls')),
    ])),
    
    # Добавляем маршрут для сообщений без API
    path('', include(message_router.urls)),
    
    # Простой маршрут для отправки сообщений
    path('send-message/', send_message, name='send_message'),
    
    # Статическая тестовая форма
    path('test/', TemplateView.as_view(template_name='test.html')),
    
    # Простая демо-форма для тестирования отправки сообщений
    path('demo-form/', TemplateView.as_view(template_name='test_form_frontend.html')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) 