@echo off
setlocal enabledelayedexpansion

:: Цвета для консоли Windows
set "CYAN=36"
set "GREEN=32"
set "YELLOW=33"
set "RED=31"

:: Функция для вывода цветного текста
call :printColor %CYAN% "=== WEBresume - Запуск проекта ==="
call :printColor %CYAN% "Выберите опцию:"
call :printColor %CYAN% "1. Запустить с помощью Docker"
call :printColor %CYAN% "2. Запустить бэкенд (Django)"
call :printColor %CYAN% "3. Запустить фронтенд (Vite)"
call :printColor %CYAN% "4. Запустить и бэкенд, и фронтенд"
call :printColor %CYAN% "0. Выход"

set /p option="Введите номер опции: "

if "%option%"=="1" (
    call :printColor %GREEN% "Запускаем с помощью Docker..."
    docker-compose up
) else if "%option%"=="2" (
    call :printColor %GREEN% "Запускаем бэкенд (Django)..."
    cd WEBresumeBack
    :: Проверяем наличие виртуального окружения
    if not exist ".venv" (
        call :printColor %YELLOW% "Создаем виртуальное окружение..."
        python -m venv .venv
    )
    :: Активируем виртуальное окружение
    call .venv\Scripts\activate.bat
    :: Устанавливаем зависимости
    pip install -r requirements.txt
    :: Выполняем миграции
    python manage.py migrate
    :: Запускаем сервер
    python manage.py runserver 8000
) else if "%option%"=="3" (
    call :printColor %GREEN% "Запускаем фронтенд (Vite)..."
    cd WEBresumeFront
    :: Устанавливаем зависимости
    npm install
    :: Запускаем сервер
    npm run dev
) else if "%option%"=="4" (
    call :printColor %GREEN% "Запускаем и бэкенд, и фронтенд..."
    :: Запускаем бэкенд в отдельном окне
    start cmd /k "cd WEBresumeBack && if not exist .venv python -m venv .venv && call .venv\Scripts\activate.bat && pip install -r requirements.txt && python manage.py migrate && python manage.py runserver 8000"
    
    :: Запускаем фронтенд в текущем окне
    cd WEBresumeFront
    :: Устанавливаем зависимости
    npm install
    :: Запускаем сервер
    npm run dev
) else if "%option%"=="0" (
    call :printColor %RED% "Выход..."
    exit /b 0
) else (
    call :printColor %RED% "Неверная опция!"
    exit /b 1
)

goto :eof

:printColor
echo [%~1m%~2[0m
goto :eof 