.PHONY: install lint format typecheck test dev clean docker-up docker-build docker-scan frontend-install frontend-dev frontend-build frontend-lint frontend-format

BACKEND_DIR = packages/backend
FRONTEND_DIR = packages/frontend
DOCKER_IMAGE = patchbay-backend:latest

install:
	poetry install
	poetry run pre-commit install

lint:
	poetry run ruff check $(BACKEND_DIR)/
	poetry run ruff format --check $(BACKEND_DIR)/

format:
	poetry run ruff format $(BACKEND_DIR)/

typecheck:
	poetry run mypy $(BACKEND_DIR)/

test:
	poetry run pytest -v

dev:
	poetry run uvicorn backend.app:app --host 0.0.0.0 --port 4333 --reload

docker-up:
	docker compose up --build

docker-build:
	docker build -t $(DOCKER_IMAGE) -f $(BACKEND_DIR)/Dockerfile .

docker-scan: docker-build
	docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest image $(DOCKER_IMAGE)

frontend-install:
	cd $(FRONTEND_DIR) && pnpm install --frozen-lockfile

frontend-dev:
	cd $(FRONTEND_DIR) && pnpm run dev

frontend-build:
	cd $(FRONTEND_DIR) && pnpm run build

frontend-lint:
	cd $(FRONTEND_DIR) && pnpm run lint

frontend-format:
	cd $(FRONTEND_DIR) && pnpm run format

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".ruff_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".mypy_cache" -exec rm -rf {} + 2>/dev/null || true
	rm -rf $(FRONTEND_DIR)/node_modules $(FRONTEND_DIR)/dist
	rm -f *.db
