import os
import django
import requests
import json
import logging

# Настраиваем логирование
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Настраиваем Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'WEBresumeBack.settings')
django.setup()

def send_direct_message():
    """Прямая отправка сообщения в Telegram без использования моделей Django"""
    try:
        # Жестко зададим данные для большей надежности
        TELEGRAM_ID = 755874397  # ID из инструкции пользователя
        TOKEN = "7426618022:AAF1awnWsXviu22F6AkB6we4GdDFFibuMvI"  # Токен из инструкции пользователя
        
        logger.info(f"Отправка прямого сообщения в Telegram: ID:{TELEGRAM_ID}, Token: {TOKEN[:10]}...")
        
        # Создаем простое тестовое сообщение
        text = "🔄 Тестовое сообщение напрямую из скрипта test_telegram_direct.py"
            
        # Формируем URL для отправки сообщения
        url = f"https://api.telegram.org/bot{TOKEN}/sendMessage"
        
        # Параметры запроса
        data = {
            "chat_id": TELEGRAM_ID,
            "text": text
        }
        
        # Детальное логирование
        logger.info(f"Отправка запроса в Telegram API: {url}")
        logger.info(f"Отправляем ID: {TELEGRAM_ID}")
        logger.info(f"Сообщение: {text}")
        
        # Отправляем запрос с повышенным таймаутом
        logger.info("Выполняем запрос к Telegram API...")
        response = requests.post(url, json=data, timeout=15)
        logger.info(f"Код ответа Telegram: {response.status_code}")
        logger.info(f"Текст ответа: {response.text}")
        
        # Проверяем успешность
        if response.status_code == 200 and response.json().get('ok'):
            logger.info("Telegram сообщение успешно отправлено")
            return True
        else:
            logger.error(f"Telegram API вернул ошибку: {response.text}")
            return False
    
    except Exception as e:
        import traceback
        logger.error(f"Исключение при отправке в Telegram: {e}")
        logger.error(traceback.format_exc())
        return False

def test_with_markdown():
    """Тестирование отправки с Markdown форматированием"""
    try:
        # Жестко зададим данные для большей надежности
        TELEGRAM_ID = 755874397  # ID из инструкции пользователя
        TOKEN = "7426618022:AAF1awnWsXviu22F6AkB6we4GdDFFibuMvI"  # Токен из инструкции пользователя
        
        # Создаем сообщение с Markdown
        text = """
📨 *Тестовое сообщение с Markdown*

👤 От: Тестовый отправитель
📧 Email: test@example.com

📝 *Сообщение:*
Это тестовое сообщение для проверки отправки в Telegram.
"""
            
        # Формируем URL для отправки сообщения
        url = f"https://api.telegram.org/bot{TOKEN}/sendMessage"
        
        # Параметры запроса с поддержкой Markdown
        data = {
            "chat_id": TELEGRAM_ID,
            "text": text,
            "parse_mode": "Markdown"
        }
        
        # Отправляем запрос
        logger.info("Отправка сообщения с Markdown...")
        response = requests.post(url, json=data, timeout=15)
        logger.info(f"Код ответа: {response.status_code}")
        logger.info(f"Ответ: {response.text}")
        
        return response.status_code == 200 and response.json().get('ok')
    
    except Exception as e:
        logger.error(f"Ошибка при отправке с Markdown: {e}")
        return False

if __name__ == "__main__":
    print("Тестирование прямой отправки сообщений в Telegram")
    result = send_direct_message()
    print(f"Результат прямой отправки: {result}")
    
    print("\nТестирование отправки с Markdown")
    markdown_result = test_with_markdown()
    print(f"Результат отправки с Markdown: {markdown_result}") 