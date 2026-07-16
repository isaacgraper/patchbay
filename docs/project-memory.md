# Project Memory

Key decisions made during the initial scaffold. Read this before making significant changes.

---

## Repository Structure

### Monorepo with `packages/` layout

```
patchbay/
  packages/
    backend/     # Python FastAPI + FastMCP server
    frontend/    # React + Vite + TypeScript UI
  user_skills/   # Volume-mounted Docker scripts
  docs/          # Documentation
```

Chosen over flat `backend/` + `frontend/` at root because it mirrors how large open-source projects (n8n, LangChain) organize monorepos. The Python package is importable as `backend` but physically lives at `packages/backend/`.

### `pyproject.toml` package mapping

```toml
packages = [{include = "backend", from = "packages"}]
```

This keeps `import backend` clean while the source is nested.

---

## CLI: Separate Repository

The `pby` CLI tool is NOT part of this repository. It will be a separate project:

- **`github.com/patchbay/patchbay`** — this repo, the server and canvas UI
- **`github.com/patchbay/pby`** — future CLI, `pby init` to bootstrap project config

Rationale:
- The CLI is a thin config generator, unrelated to the server runtime
- Different release cycles (CLI updates don't require server restarts)
- Different dependency profiles (CLI is pure Python with no FastAPI/FastMCP deps)
- Users who only consume pipelines don't need the server source

---

## No Emoji in Docs or Code

Emojis are not used in any documentation, commit messages, or code. This is intentional for a professional, tool-focused project.

---

## Frontend

### Tailwind CSS v3 (not v4)

Chose v3 with `tailwind.config.ts` over v4's CSS-first approach because:
- v3 is stable and widely understood
- v4 may have breaking changes in the ecosystem
- Migration path from v3 to v4 is well-documented when the time comes

### Frontend is not Dockerized

The frontend runs bare via `npm run dev` during development and is not part of `docker-compose.yml`. The deployable frontend is built to static files (`vite build`) and served separately.

The `base: './'` setting in `vite.config.ts` enables filesystem-based serving for future desktop packaging (Tauri/Electron).

### Vite proxy for API calls

In development, Vite proxies `/api` and `/mcp` to `http://localhost:4333`. This avoids CORS issues. The proxy is:

```ts
server: {
  proxy: {
    "/api": { target: "http://localhost:4333", changeOrigin: true },
    "/mcp": { target: "http://localhost:4333", changeOrigin: true, ws: true },
  },
}
```

---

## Backend

### Python 3.12, not 3.13

Python 3.12 is the target version. It's the latest with broad library support. Used in both `pyproject.toml` and CI.

### mypy strict mode

```toml
[tool.mypy]
strict = true
allow_untyped_decorators = true
```

Strict mode catches real issues. `allow_untyped_decorators = true` is necessary because FastAPI and FastMCP decorators lack PEP 484 typing.

### Ruff for linting and formatting

```toml
[tool.ruff]
select = ["E", "F", "I", "N", "W"]
```

Ruff replaces both flake8 (lint) and black (format). It's significantly faster and handles import sorting.

### Database: SQLite via SQLAlchemy async

```toml
sqlalchemy = {extras = ["asyncio"], version = "^2.0.0"}
aiosqlite = "^0.20.0"
```

Chosen over:
- **PostgreSQL** — overkill for a local-first desktop app
- **Redis** — no need for a separate service
- **JSON file** — too fragile for concurrent access

SQLite with async drivers handles the expected concurrency (one user, multiple pipeline runs) without requiring a database server.

### Alembic for migrations

Even though SQLite is schema-flexible, Alembic provides:
- Version-controlled schema changes
- Rollback capability
- A clear migration history

The async migration environment in `env.py` uses `run_async_migrations()` with `async_engine_from_config`.

---

## Pre-commit

Seven hooks run on every commit:

1. `trailing-whitespace` — trim trailing whitespace
2. `end-of-file-fixer` — ensure files end with newline
3. `check-yaml` — validate YAML syntax
4. `check-json` — validate JSON syntax
5. `ruff` — lint and auto-fix
6. `ruff-format` — auto-format
7. `mypy` — static type checking

The mypy hook runs against `packages/backend/` with `pass_filenames: false` to check the whole project on every commit, not just changed files.

---

## CI (GitHub Actions)

Two jobs run in parallel on push/PR to `main` and `dev`:

- **backend**: Python 3.12, Poetry, ruff lint, ruff format check, mypy, pytest
- **frontend**: Node 20 and 22, npm ci, tsc, vite build

The cache key for Poetry's virtualenv includes a hash of `poetry.lock`.

---

## Documentation

- `docs/concept.md` — the "pre-commit for AI" narrative, fragmentation problem
- `docs/architecture.md` — three-layer stack, endpoint reference, data flow
- `docs/interaction-modes.md` — plan/edit/chat/audit modes, mode selection
- `docs/pipeline-lifecycle.md` — DAG execution lifecycle, node types, error handling
- `docs/mcp-config.md` — connection configuration for AI clients
- `docs/project-memory.md` — this file, decision log

---

## Open Questions

- **Desktop packaging**: Tauri vs Electron for the final desktop app (deferred)
- **CLI naming**: `pby` vs `patchbay-cli` vs something else (deferred)
- **Pipeline sharing**: How will users share pipelines? Git-based? Registry? (deferred)
- **Plugin system**: Will node types be extensible? (deferred)
- **Multi-user**: Will a single Patchbay instance support multiple developers? (deferred)
