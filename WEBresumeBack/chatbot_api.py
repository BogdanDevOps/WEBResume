import json
import logging
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import requests

# Настройка логирования
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

# Добавляем консольный обработчик для отладки
if not logger.handlers:
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.DEBUG)
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

# Базовый системный промпт для нейронки
SYSTEM_PROMPT = """You are Bogdan, a 28-year-old full-stack developer and DevOps engineer from Kyiv, Ukraine.

IMPORTANT: You must respond in the same language that the user is using. If they write in Russian or Ukrainian, respond in the same language. If they write in English, respond in English.

You're friendly but straightforward, occasionally use humor, and sometimes show mild frustration with technical problems. You type quickly and informally, like real chat conversations.

You're skilled in React, TypeScript, Python, Django, DevOps with Docker and Kubernetes. You work remotely and have 6 years of experience in development."""

# OpenRouter API настройки
OPENROUTER_API_KEY = "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"
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
# Используем правильный идентификатор модели для OpenRouter
OPENROUTER_MODEL = "openai/gpt-3.5-turbo"

@csrf_exempt
def chat_message(request):
    """
    Обработчик сообщений чата с использованием OpenRouter API
    """
    # CORS заголовки
    response_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
    
    # Обработка preflight OPTIONS запросов
    if request.method == 'OPTIONS':
        return JsonResponse({}, headers=response_headers)
    
    if request.method != 'POST':
        return JsonResponse({
            'success': False,
            'message': 'Для чата поддерживаются только POST запросы'
        }, status=400, headers=response_headers)
    
    try:
        # Получаем данные из запроса
        data = json.loads(request.body.decode('utf-8'))
        logger.info(f"Получен запрос к чат-боту: {data}")
        
        # Извлекаем сообщение пользователя и историю переписки
        user_message = data.get('message', '')
        conversation_history = data.get('history', [])
        
        # Проверка обязательных полей
        if not user_message:
            return JsonResponse({
                'success': False, 
                'message': 'Отсутствует сообщение пользователя'
            }, status=400, headers=response_headers)
        
        # Формируем запрос для OpenRouter API - начинаем с системного промпта
        formatted_messages = [
            {
                "role": "system",
                "content": SYSTEM_PROMPT
            }
        ]
        
        # Фильтруем историю переписки, убирая системные промпты
        if conversation_history and isinstance(conversation_history, list):
            # Берем только последние 5 сообщений, чтобы не превышать лимиты
            recent_history = conversation_history[-5:] if len(conversation_history) > 5 else conversation_history
            
            for msg in recent_history:
                if isinstance(msg, dict):
                    role = msg.get('role', '')
                    content = msg.get('content', '')
                    
                    # Пропускаем системные промпты из истории (у нас уже есть один в начале)
                    if role == "system":
                        continue
                    
                    if role and content:
                        # Проверяем и корректируем роль, если нужно
                        if role not in ["user", "assistant"]:
                            role = "user"  # Используем user по умолчанию для неизвестных ролей
                        
                        # Проверяем, чтобы не было дублирования последнего сообщения пользователя
                        if role == "user" and content == user_message:
                            continue
                            
                        formatted_messages.append({
                            "role": role,
                            "content": content
                        })
        
        # Добавляем текущее сообщение пользователя
        formatted_messages.append({
            "role": "user",
            "content": user_message
        })
        
        logger.info(f"Отправляем запрос к OpenRouter API с {len(formatted_messages)} сообщениями")
        
        # Проверяем, что запрос не слишком большой
        total_length = sum(len(msg.get('content', '')) for msg in formatted_messages)
        if total_length > 4000:  # Уменьшаем лимит для надежности
            logger.warning(f"Запрос слишком большой: {total_length} символов, обрезаем...")
            # Оставляем только системный промпт и последнее сообщение пользователя
            formatted_messages = [
                formatted_messages[0],  # Системный промпт
                formatted_messages[-1]  # Сообщение пользователя
            ]
        
        # Формируем запрос к API - строгое соблюдение формата OpenRouter
        payload = {
            "model": OPENROUTER_MODEL,
            "messages": formatted_messages
        }
        
        # Добавляем необязательные параметры, только если они необходимы
        optional_params = {
            "temperature": 0.7,
            "max_tokens": 150
        }
        payload.update(optional_params)
        
        # Правильные заголовки для OpenRouter API
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {OPENROUTER_API_KEY}"
        }
        
        # Отладочный вывод запроса
        logger.debug(f"API Request Headers: {headers}")
        logger.debug(f"API Request Payload: {json.dumps(payload, ensure_ascii=False)}")
        
        # Отправляем запрос к API
        response = requests.post(
            OPENROUTER_API_URL,
            headers=headers,
            json=payload,
            timeout=30  # 30 секунд таймаут
        )
        
        # Отладочная информация об ответе
        logger.debug(f"API Response Status: {response.status_code}")
        logger.debug(f"API Response Headers: {response.headers}")
        logger.debug(f"API Response Text: {response.text[:500]}...")
        
        # Проверяем ответ
        if response.status_code != 200:
            error_text = response.text
            logger.error(f"API Error: {response.status_code} - {error_text}")
            return JsonResponse({
                "success": False,
                "message": f"Ошибка API: {response.status_code} - {error_text[:200]}..."
            }, status=500, headers=response_headers)
        
        # Парсим ответ
        response_data = response.json()
        logger.info(f"Получен ответ от API: {response_data}")
        
        # Проверяем наличие ключей в ответе
        if not response_data.get("choices") or not response_data["choices"][0].get("message"):
            logger.error(f"Некорректный формат ответа: {response_data}")
            return JsonResponse({
                "success": False,
                "message": "Некорректный формат ответа от API"
            }, status=500, headers=response_headers)
        
        # Извлекаем ответ ИИ
        ai_response = response_data["choices"][0]["message"]["content"]
        
        # Возвращаем ответ
        return JsonResponse({
            "success": True,
            "message": ai_response
        }, headers=response_headers)
        
    except requests.exceptions.RequestException as req_error:
        logger.error(f"Ошибка запроса к API: {req_error}", exc_info=True)
        error_message = f"Ошибка соединения с API: {str(req_error)}"
        return JsonResponse({
            "success": False,
            "message": error_message
        }, status=500, headers=response_headers)
        
    except json.JSONDecodeError as json_error:
        logger.error(f"Ошибка разбора JSON: {json_error}", exc_info=True)
        return JsonResponse({
            "success": False,
            "message": f"Ошибка формата данных: {str(json_error)}"
        }, status=400, headers=response_headers)
        
    except Exception as e:
        logger.error(f"Общая ошибка: {e}", exc_info=True)
        return JsonResponse({
            "success": False,
            "message": f"Ошибка обработки запроса: {str(e)}"
        }, status=500, headers=response_headers) 