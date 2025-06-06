import json
import requests
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt

# Настройки Telegram бота (жестко зашитые для гарантированной работы)
BOT_TOKEN = "7426618022:AAF1awnWsXviu22F6AkB6we4GdDFFibuMvI"
CHAT_ID = 755874397

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
        import traceback
        traceback.print_exc()
        return JsonResponse({
            'success': False,
            'message': f'Непредвиденная ошибка: {str(e)}'
        }, status=500, headers=response_headers) 