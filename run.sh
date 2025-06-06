#!/bin/bash

# Скрипт для запуска проекта

# Функция для вывода цветного текста
print_color() {
    COLOR=$1
    TEXT=$2
    echo -e "\e[${COLOR}m${TEXT}\e[0m"
}

# Вывод информации
print_color "36" "=== WEBresume - Запуск проекта ==="
print_color "36" "Выберите опцию:"
print_color "36" "1. Запустить с помощью Docker"
print_color "36" "2. Запустить бэкенд (Django)"
print_color "36" "3. Запустить фронтенд (Vite)"
print_color "36" "4. Запустить и бэкенд, и фронтенд"
print_color "36" "0. Выход"

read -p "Введите номер опции: " option

case $option in
    1)
        print_color "32" "Запускаем с помощью Docker..."
        docker-compose up
        ;;
    2)
        print_color "32" "Запускаем бэкенд (Django)..."
        cd WEBresumeBack
        # Проверяем наличие виртуального окружения
        if [ ! -d ".venv" ]; then
            print_color "33" "Создаем виртуальное окружение..."
            python -m venv .venv
        fi
        # Активируем виртуальное окружение
        source .venv/bin/activate || source .venv/Scripts/activate
        # Устанавливаем зависимости
        pip install -r requirements.txt
        # Выполняем миграции
        python manage.py migrate
        # Запускаем сервер
        python manage.py runserver 8000
        ;;
    3)
        print_color "32" "Запускаем фронтенд (Vite)..."
        cd WEBresumeFront
        # Устанавливаем зависимости
        npm install
        # Запускаем сервер
        npm run dev
        ;;
    4)
        print_color "32" "Запускаем и бэкенд, и фронтенд..."
        # Запускаем бэкенд в фоновом режиме
        cd WEBresumeBack
        # Проверяем наличие виртуального окружения
        if [ ! -d ".venv" ]; then
            print_color "33" "Создаем виртуальное окружение..."
            python -m venv .venv
        fi
        # Активируем виртуальное окружение
        source .venv/bin/activate || source .venv/Scripts/activate
        # Устанавливаем зависимости
        pip install -r requirements.txt
        # Выполняем миграции
        python manage.py migrate
        # Запускаем сервер в фоне
        python manage.py runserver 8000 &
        BACKEND_PID=$!
        
        # Запускаем фронтенд
        cd ../WEBresumeFront
        # Устанавливаем зависимости
        npm install
        # Запускаем сервер
        npm run dev
        
        # При выходе убиваем фоновый процесс бэкенда
        kill $BACKEND_PID
        ;;
    0)
        print_color "31" "Выход..."
        exit 0
        ;;
    *)
        print_color "31" "Неверная опция!"
        exit 1
        ;;
esac 