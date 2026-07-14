.PHONY: install lint format typecheck test dev clean docker-up frontend-install frontend-dev

# Backend
install:
	poetry install
	poetry run pre-commit install

lint:
	poetry run ruff check backend/ tests/

format:
	poetry run ruff format backend/ tests/

typecheck:
	poetry run mypy backend/

test:
	poetry run pytest

dev:
	poetry run uvicorn backend.main:app --host 0.0.0.0 --port 4333 --reload

# Docker
docker-up:
	docker compose up --build

# Frontend
frontend-install:
	cd frontend && npm install

frontend-dev:
	cd frontend && npm run dev

frontend-build:
	cd frontend && npm run build

# Utilities
clean:
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".ruff_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".mypy_cache" -exec rm -rf {} + 2>/dev/null || true
	rm -rf frontend/node_modules frontend/dist
	rm -f *.db
