FROM python:3.12-slim
ENV PYTHONUNBUFFERED=1 PYTHONPATH=/app/src
WORKDIR /app
COPY shared /app/shared
RUN pip install --no-cache-dir /app/shared
COPY services/notification_service/src /app/src
CMD ["uvicorn", "notification_service.main:app", "--host", "0.0.0.0", "--port", "8000"]
