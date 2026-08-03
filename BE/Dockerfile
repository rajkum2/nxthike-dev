FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

ENV PYTHONPATH=/app

# create_all runs in app lifespan; alembic is optional (set SKIP_ALEMBIC=false to enforce)
CMD ["sh", "-c", "if [ \"${SKIP_ALEMBIC:-true}\" != \"true\" ]; then alembic upgrade head || echo 'alembic failed, continuing'; fi; uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
