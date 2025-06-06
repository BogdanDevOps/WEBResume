# WEBresume - Персональное портфолио с отправкой сообщений в Telegram

Проект веб-сайта-портфолио с возможностью отправки сообщений в Telegram. Проект состоит из фронтенда на React/Vite и бэкенда на Django.

## Структура проекта

- `WEBresumeBack/` - Бэкенд на Django
- `WEBresumeFront/` - Фронтенд на React/Vite
- `docker-compose.yml` - Файл для запуска через Docker

## Требования

### Без Docker

- Python 3.11+
- Node.js 16+
- npm/yarn

### С использованием Docker

- Docker
- Docker Compose

## Установка и запуск

### Вариант 1: Запуск через Docker (рекомендуется)

1. Клонируйте репозиторий:

```bash
git clone https://github.com/yourusername/WEBresume.git
cd WEBresume
```

2. Запустите контейнеры с помощью Docker Compose:

```bash
docker-compose up
```

После запуска:
- Фронтенд будет доступен по адресу: http://localhost:8080
- Бэкенд (API) будет доступен по адресу: http://localhost:8000

### Вариант 2: Ручной запуск

#### Бэкенд (Django)

1. Перейдите в директорию бэкенда:

```bash
cd WEBresumeBack
```

2. Создайте и активируйте виртуальное окружение:

```bash
python -m venv .venv
.venv\Scripts\activate  # для Windows
source .venv/bin/activate  # для macOS/Linux
```

3. Установите зависимости:

```bash
pip install -r requirements.txt
```

4. Выполните миграции:

```bash
python manage.py migrate
```

5. Запустите сервер разработки:

```bash
python manage.py runserver 8000
```

#### Фронтенд (React/Vite)

1. Перейдите в директорию фронтенда:

```bash
cd WEBresumeFront
```

2. Установите зависимости:

```bash
npm install
```

3. Запустите сервер разработки:

```bash
npm run dev
```

## Настройка Telegram-уведомлений

Для работы уведомлений в Telegram необходимо:

1. Создать бота через BotFather в Telegram и получить токен.
2. Настроить профиль в административной панели Django.
3. Указать Telegram ID в файле `WEBresumeBack/resume/views.py`.

По умолчанию сообщения из формы обратной связи будут отправляться в Telegram по указанному ID: 755874397.

## Разработка

### Структура API

- `/api/messages/` - Отправка сообщений
- `/api/projects/` - Управление проектами
- `/api/profiles/` - Управление профилями

## Лицензия

MIT 