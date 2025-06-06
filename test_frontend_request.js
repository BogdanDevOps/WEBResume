// Тестовый скрипт для отправки запросов с фронтенда на бэкенд
// Для Node.js версии 18+ fetch доступен глобально

async function sendTestMessage() {
  try {
    console.log('Отправка тестового сообщения с фронтенда...');
    
    const formData = {
      sender_name: 'Тестовый пользователь',
      sender_email: 'test@example.com',
      message: 'Это тестовое сообщение с фронтенда'
    };
    
    console.log('Данные для отправки:', formData);
    const jsonData = JSON.stringify(formData);
    
    console.log('Отправляем запрос на http://localhost:8000/send-message/');
    const response = await fetch('http://localhost:8000/send-message/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: jsonData
    });
    
    console.log('Статус ответа:', response.status);
    const responseText = await response.text();
    console.log('Ответ сервера (текст):', responseText);
    
    try {
      const responseData = JSON.parse(responseText);
      console.log('Ответ сервера (объект):', responseData);
    } catch (jsonError) {
      console.error('Ошибка разбора JSON ответа:', jsonError);
    }
    
    if (response.ok) {
      console.log('Сообщение успешно отправлено!');
    } else {
      console.error('Ошибка отправки сообщения!');
    }
  } catch (error) {
    console.error('Произошла ошибка:', error);
  }
}

// Выполняем отправку сообщения
sendTestMessage().then(() => {
  console.log('Скрипт завершен');
}).catch(err => {
  console.error('Ошибка в скрипте:', err);
}); 