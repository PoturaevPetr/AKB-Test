#!/bin/bash
set -e

# Выполняем миграции Alembic
alembic upgrade head

# Запускаем uvicorn
exec "$@"