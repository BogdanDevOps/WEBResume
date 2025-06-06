# Resume Portfolio Backend

This is the backend for a resume portfolio website built with Django and Django REST Framework.

## Setup

1. Create a virtual environment:
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file in the project root with the following variables:
```
DEBUG=True
SECRET_KEY=your-secret-key-here
TELEGRAM_BOT_TOKEN=7426618022:AAF1awnWsXviu22F6AkB6we4GdDFFibuMvI
TELEGRAM_USERNAME=@Bogdan_LegacyForgeSolutions
ENCRYPTION_KEY=your-32-byte-encryption-key-here==
```

4. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

5. Create a superuser:
```bash
python manage.py createsuperuser
```

6. Run the development server:
```bash
python manage.py runserver
```

## Features

- User authentication
- Profile management with encrypted Telegram token
- Project showcase with images and video links
- Contact form with Telegram bot integration
- Admin dashboard for managing content
- RESTful API endpoints

## API Endpoints

- `/api/profiles/` - Profile management
- `/api/projects/` - Project showcase
- `/api/messages/` - Contact form messages
- `/api-auth/` - Authentication endpoints

## Security

- Telegram bot token is encrypted in the database
- Session-based authentication
- CORS protection
- File upload validation 