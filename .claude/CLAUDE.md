# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Patchbay is an offline-first gateway that sits between local AI clients (Claude Code, opencode, Cline) and tools/models/skills. Users wire up "nodes" (triggers, context skills, models, MCP tool servers) on a drag-and-drop canvas into DAG pipelines. AI clients call `run_pipeline` over MCP, Patchbay executes the DAG, and returns a transformed result before it reaches the model.

Read `docs/concept.md` (the "pre-commit for AI" narrative) and `docs/architecture.md` (three-layer stack) before making structural changes. `docs/project-memory.md` is a decision log — check it before revisiting settled choices (e.g. SQLite over Postgres, Tailwind v3 over v4, `pby` CLI kept in a separate repo).

**Implementation status**: the docs in `docs/` describe the target design; the code is an early scaffold. `run_pipeline` in `packages/backend/src/backend/routes/mcp.py` is a stub that echoes input rather than executing a DAG, and `execute_pipeline` in `packages/backend/src/backend/services/pipeline_executor.py` raises `NotImplementedError`. `services/pipelines.py` has `create_pipeline`/`get_pipeline`/`list_pipelines` DB helpers, but they aren't yet exposed as MCP tools. Don't assume documented behavior (DAG execution, topological sort, node types, `list_pipelines`/`get_pipeline`/`create_pipeline` MCP tools) is implemented — check the actual source before relying on it.

## Commands

Run from the repo root unless noted.

```bash
make install          # poetry install + pre-commit install
make frontend-install  # pnpm install --frozen-lockfile (packages/frontend)

make dev               # backend: uvicorn on :4333 with reload
make frontend-dev      # frontend: vite on :5173

make lint              # ruff check + format --check on packages/backend/
make format            # ruff format (auto-fix) on packages/backend/
make typecheck         # mypy packages/backend/ (strict mode)
make test              # pytest -v (packages/backend/tests)
make frontend-lint     # biome check (packages/frontend)
make frontend-format   # biome format --write (packages/frontend)

make docker-up          # docker compose up --build (backend only)
make docker-build       # docker build the backend image (patchbay-backend:latest)
make docker-scan        # docker-build, then scan the image with Trivy
make clean              # remove caches, node_modules, dist, *.db
```

Frontend-only checks (run from `packages/frontend/`, mirrors CI):
```bash
npx tsc --noEmit    # type check
pnpm run build      # tsc -b && vite build
pnpm run lint       # biome check
```

Single test file/case:
```bash
poetry run pytest packages/backend/tests/test_placeholder.py
poetry run pytest packages/backend/tests/test_placeholder.py::test_placeholder
```

Pre-commit hooks (trailing-whitespace, end-of-file-fixer, check-yaml, check-json, ruff, ruff-format, mypy) run automatically on commit; run manually with `poetry run pre-commit run --all-files`. The mypy hook always checks the whole `packages/backend/` tree (`pass_filenames: false`), not just staged files.

Database migrations (Alembic, async, config at repo-root `alembic.ini`, scripts under `packages/backend/migrations/`):
```bash
poetry run alembic revision --autogenerate -m "description"
poetry run alembic upgrade head
```

## Architecture

Monorepo under `packages/`: the Python package `backend` lives at `packages/backend/src/backend` (mapped via `pyproject.toml`'s `packages = [{include = "backend", from = "packages/backend/src"}]`, so it imports as `backend.*` despite the nested path). Frontend is a separate npm project at `packages/frontend`.

```
packages/
  backend/
    migrations/       # Alembic env (async)
    src/backend/
      app.py           # FastAPI app, CORS, lifespan (init_db), mounts routes
      config.py        # pydantic-settings Settings
      routes/
        health.py       # /health REST endpoint
        mcp.py           # Starlette sub-app: SSE mount, FastMCP tool registration (run_pipeline stub)
      services/
        pipelines.py         # create_pipeline/get_pipeline/list_pipelines DB helpers
        pipeline_executor.py  # execute_pipeline (currently a stub — NotImplementedError)
        cache.py              # get_cache/set_cache (TTL-aware kv cache)
      models/
        db.py            # SQLAlchemy models: Pipeline, PipelineRun, KeyValueCache
      dependencies/
        database.py      # async engine/session, init_db()
      modules/          # placeholder — shared cross-cutting concerns (e.g. pagination), none yet
      exceptions/       # placeholder — app-wide exception types, none yet
      utils/            # placeholder — shared utility functions, none yet
  frontend/
    src/
      pages/          # Dashboard, WorkflowEditor, Settings (routed in App.tsx)
      components/canvas/  # Canvas, NodePalette, NodeInspector (React-Flow based)
      stores/pipelineStore.ts  # Zustand store: nodes/edges/selection
      types/pipeline.ts        # PipelineNode/Edge/Pipeline types
      utils/api.ts    # thin fetch wrapper, reads VITE_API_URL
user_skills/          # volume-mounted into Docker; user-authored MCP skill scripts
```

**Backend**: FastAPI app in `app.py` mounts a Starlette sub-app (`routes/mcp.py`) at `/mcp` that exposes `/mcp/sse` (SSE connect) and `/mcp/messages/` (JSON-RPC POST) via `mcp.server.sse.SseServerTransport`, backed by a `FastMCP("Patchbay")` instance. MCP tools are registered with `@mcp.tool()` directly in `routes/mcp.py`. `/health` (`routes/health.py`) is a plain REST endpoint. On startup (`lifespan`), `init_db()` (`dependencies/database.py`) creates SQLite tables if missing — there's no separate migration-on-boot step; Alembic is for intentional schema changes. `modules/`, `exceptions/`, and `utils/` are structural placeholders (near-empty, `__init__.py` only) for future shared cross-cutting code — don't read them as implemented features. **There is no auth layer, and none is planned** — Patchbay is offline-first and single-local-user, with no network-facing surface that needs authenticating; see `docs/project-memory.md`.

**Database**: SQLite via SQLAlchemy 2.0 async + `aiosqlite`, one file at `./patchbay.db` (path overridable via `DATABASE_URL` env var). Three tables: `pipelines` (DAG JSON blob per pipeline), `pipeline_runs` (execution history/status/logs), `kv_cache` (TTL-aware key-value cache used by `services/cache.py`'s `get_cache`/`set_cache`).

**Frontend**: React + Vite + TypeScript, React-Flow (`@xyflow/react`) for the DAG canvas, Zustand for canvas state, TanStack Query for server state, Tailwind CSS v3 (not v4 — intentional, see `docs/project-memory.md`), React Router for the three pages (`/`, `/workflows/:id`, `/settings`). Vite dev server proxies `/api` and `/mcp` to `localhost:4333` (`vite.config.ts`) to avoid CORS. `base: './'` is set for future filesystem-based/desktop packaging, not for a standard web deploy. Package manager is `pnpm` (not npm — see `pnpm-lock.yaml`); Biome handles lint+format (`biome.json`, `make frontend-lint`/`make frontend-format`). Only env vars meant to reach the browser bundle get the `VITE_` prefix (e.g. `VITE_API_URL`); secrets and server-only config must stay unprefixed.

**Frontend is not Dockerized** — only the backend is in `docker-compose.yml`; the frontend runs bare (`pnpm run dev`) or is built to static files and served separately.

**The `pby` CLI does not live in this repo.** It's planned as a separate project (`pby init` to generate `.mcp.json`); don't add CLI code here — see `docs/project-memory.md` for rationale.

## Conventions

- No emoji in code, commit messages, or documentation (intentional, project-wide).
- Commit messages: `type: description`, no scope. Type is one of `feat`/`add`/`fix`/`update` only — not the full conventional-commits vocabulary (no `refactor`/`build`/`ci`/`chore`/etc).
- Branch from `dev`, PR back to `dev` (not `main`).
- Python: Ruff for lint+format (replaces flake8/black), mypy strict mode. `allow_untyped_decorators = true` is required because FastAPI/FastMCP decorators aren't PEP 484 typed — don't remove it.
- TypeScript: strict mode, no unchecked side-effect imports.
- Frontend package manager is `pnpm`, not `npm`; Biome (not ESLint/Prettier) handles lint+format — don't reintroduce either.
