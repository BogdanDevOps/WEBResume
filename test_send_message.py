import requests
import json

def test_send_message():
    """
    Тестирование отправки сообщения через API
    """
    print("Тестирование отправки сообщения...")
    
    # URL для отправки сообщений
    url = "http://localhost:8000/send-message/"
    
    # Данные сообщения
    data = {
        "sender_name": "Тестовый отправитель",
        "sender_email": "test@example.com",
        "message": "Это тестовое сообщение для проверки отправки в Telegram."
    }
    
    # Заголовки запроса
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    try:
        print(f"Отправка POST запроса на {url}")
        print(f"Данные: {json.dumps(data, ensure_ascii=False)}")
        
        # Отправляем запрос
        response = requests.post(url, json=data, headers=headers, timeout=30)
        
        # Выводим результат
        print(f"Код ответа: {response.status_code}")
        print(f"Заголовки ответа: {response.headers}")
        print(f"Тело ответа: {response.text}")
        
        if response.status_code == 200:
            print("Запрос успешно обработан!")
        else:
            print(f"Ошибка при обработке запроса: {response.status_code}")
    
    except Exception as e:
        print(f"Ошибка при отправке запроса: {e}")

if __name__ == "__main__":
    test_send_message() 