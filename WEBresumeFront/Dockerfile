FROM node:18-alpine

# Установка рабочей директории в контейнере
WORKDIR /app

# Копирование файлов package.json и package-lock.json
COPY package*.json ./

# Установка зависимостей
RUN npm ci

# Копирование остальных файлов проекта
COPY . .

# Порт для Vite
EXPOSE 8080

# Команда для запуска в dev режиме
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"] 