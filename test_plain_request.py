import requests
import json

def send_test_message():
    """Отправляем тестовое сообщение на бэкенд"""
    print("Отправка тестового сообщения на бэкенд...")
    
    url = "http://localhost:8000/send-message/"
    data = {
        "sender_name": "Тестовый Python скрипт",
        "sender_email": "python@example.com",
        "message": "Это тестовое сообщение с Python скрипта"
    }
    
    print(f"URL: {url}")
    print(f"Данные: {json.dumps(data, ensure_ascii=False)}")
    
    # Отправляем запрос
    try:
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        print("Заголовки:", headers)
        
        response = requests.post(url, json=data, headers=headers)
        
        print(f"Статус ответа: {response.status_code}")
        print(f"Заголовки ответа: {response.headers}")
        
        try:
            response_json = response.json()
            print(f"Ответ (JSON): {json.dumps(response_json, ensure_ascii=False)}")
        except json.JSONDecodeError:
            print(f"Ответ (текст): {response.text}")
        
        if response.ok:
            print("Сообщение успешно отправлено!")
        else:
            print(f"Ошибка отправки: {response.status_code}")
            
    except Exception as e:
        print(f"Ошибка при отправке запроса: {e}")

if __name__ == "__main__":
    send_test_message() 