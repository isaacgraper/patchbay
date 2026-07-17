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
packages = [{include = "backend", from = "packages/backend/src"}]
```

This keeps `import backend` clean while the source is nested. The backend was later restructured to a `src/` layout (`packages/backend/src/backend/`) with `app.py`, `config.py`, `routes/`, `services/`, `models/`, `dependencies/` — see `CLAUDE.md`'s architecture tree for the current shape.

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

### pnpm + Biome, not npm + ESLint/Prettier

The frontend package manager is `pnpm` (`pnpm-lock.yaml`, `packageManager` field in `package.json`), not `npm`. Lint and format run through Biome (`biome.json`), which was adopted directly — there was no prior ESLint/Prettier setup to migrate off. `.npmrc` sets `engine-strict=true`, `audit=true`, `ignore-scripts=true`; none of the current dependencies need install-time scripts, so this is a safe default rather than a workaround.

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

### No authentication layer

Patchbay has no auth system, and none is planned. It's offline-first and single-local-user — the FastAPI/MCP server binds to `localhost` for one person's own AI clients and tools, with no network-facing surface that needs authenticating. There's no `routes/auth/` in the codebase; don't add one speculatively. Revisit only if the multi-user question below is ever answered "yes."

### Alembic for migrations

Even though SQLite is schema-flexible, Alembic provides:
- Version-controlled schema changes
- Rollback capability
- A clear migration history

The async migration environment in `env.py` uses `run_async_migrations()` with `async_engine_from_config`.

### Docker: multi-stage, non-root user, `python:3.12-slim-bookworm`

`packages/backend/Dockerfile` builds dependencies in a `poetry install --no-root --only main` stage (not `poetry export` + `pip install`), then copies only the compiled `.venv` into a slim runtime stage that drops root privileges (dedicated `patchbay` user/group, uid/gid 10001) before `CMD`. `make docker-scan` builds the image and runs Trivy (`aquasec/trivy:latest`) against it — findings aren't currently gated in CI, this is a local/manual check. Because the container no longer runs as root, the `./patchbay.db` bind mount in `docker-compose.yml` needs to be pre-created and chowned to uid 10001 on the host before first run (documented inline in `docker-compose.yml`).

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

`ci.yml` runs two jobs in parallel on push/PR to `main` and `dev`:

- **backend**: Python 3.12, Poetry, ruff lint, ruff format check, mypy, pytest
- **frontend**: Node 20 and 22, pnpm install --frozen-lockfile, tsc, vite build

The cache key for Poetry's virtualenv includes a hash of `poetry.lock`; the frontend job caches on `pnpm-lock.yaml`.

A separate `frontend-security.yml` workflow, path-filtered to `packages/frontend/**`, runs Biome lint and `pnpm audit --audit-level=high` on push/PR. It's kept out of `ci.yml` deliberately: audit findings shouldn't block every unrelated PR the same way a broken build does, so the audit step runs with `continue-on-error: true` until the team defines a blocking policy.

---

## Tooling

### Turborepo: not adopted

Considered for task orchestration/caching across the monorepo but deliberately not added. The repo has one JS/TS package (`packages/frontend`) and a Poetry-managed Python backend — Turbo's content-hash build caching doesn't meaningfully apply to `pytest`/`mypy`/SQLite artifacts the way it does to `dist/` output, and there's nothing to parallelize against with only one JS package. A backend passthrough `package.json` (scripts that just shell out to `make` targets) would add a second package-manager surface for no real caching benefit. Revisit if a second JS/TS package (e.g. a future desktop shell) is added.

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
