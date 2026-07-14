# Contributing to Patchbay

## Prerequisites

- Python 3.12+
- [Poetry](https://python-poetry.org/docs/#installation) (install via `pipx install poetry`)
- Node.js 20+
- Docker (optional, for containerized deployment)

## Setup

```bash
# Clone the repository
git clone https://github.com/your-username/patchbay.git
cd patchbay

# Backend
cp .env.example .env
make install

# Frontend
make frontend-install
```

## Development workflow

Start both services in separate terminals:

```bash
# Terminal 1: Backend API server (port 4333)
make dev

# Terminal 2: Frontend dev server (port 5173)
make frontend-dev
```

## Code quality

All checks must pass before merging:

```bash
make lint      # ruff lint and format check
make typecheck # mypy static type checking
make test      # pytest test suite
```

Pre-commit hooks run automatically on every commit. You can run them manually:

```bash
poetry run pre-commit run --all-files
```

## Project structure

```
patchbay/
  packages/
    backend/     # Python FastAPI + FastMCP server
    frontend/    # React + Vite + TypeScript UI
  user_skills/   # Volume-mounted MCP skill scripts
```

## Pull request process

1. Branch from `dev` and submit PRs to `dev`
2. Keep PRs focused on a single concern
3. Ensure all CI checks pass (lint, typecheck, test, build)
4. Update documentation if adding or changing features
5. Maintain or improve test coverage

## Code style

- Python: Ruff (lint + format), mypy strict mode
- TypeScript: strict mode, no unchecked side effect imports
- No emoji in commit messages or documentation
- Conventional commit format: `type(scope): description`
