FROM python:3.12-slim AS builder

WORKDIR /app

RUN pip install --no-cache-dir poetry

COPY pyproject.toml poetry.lock* ./
RUN poetry export --without-hashes -f requirements.txt > requirements.txt

FROM python:3.12-slim

WORKDIR /app

COPY --from=builder /app/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY packages/backend/src/backend/ ./backend/
COPY user_skills/ ./user_skills/

EXPOSE 4333

CMD ["python", "-m", "uvicorn", "backend.app:app", "--host", "0.0.0.0", "--port", "4333"]
