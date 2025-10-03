# Используем официальный Python образ
FROM python:3.10-slim

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы зависимостей
COPY requirements.txt .

# Устанавливаем зависимости
RUN pip install --no-cache-dir -r requirements.txt

# Копируем весь проект
COPY . .

# Открываем порт для API
EXPOSE 8000

# Команда запуска сервера
CMD ["uvicorn", "run:webApi", "--host", "0.0.0.0", "--port", "8000"]