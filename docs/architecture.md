# Architecture

## System Overview

Patchbay is a three-layer application:

```
┌──────────────┐
│  Frontend    │  React + Vite + React-Flow
│  (:5173)     │  Drag-and-drop canvas, pipeline management UI
└──────┬───────┘
       │ HTTP (proxy via Vite)
       ▼
┌──────────────┐
│  Backend     │  FastAPI + FastMCP + SQLAlchemy
│  (:4333)     │  REST API, MCP SSE transport, DAG execution
└──────┬───────┘
       │
       ├── MCP SSE ──► AI Clients (Claude Code, opencode, etc.)
       │
       └── SQLite ──► Persistence (pipelines, runs, cache)
```

## Repository Structure

```
patchbay/
  packages/
    backend/          # Python server
      main.py         # FastAPI app + FastMCP + SSE transport
      core/           # DAG execution, pipeline routing
      database/       # SQLAlchemy models, async engine, CRUD
    frontend/         # TypeScript UI
      src/            # React components, pages, stores
  user_skills/        # Volume-mounted into Docker
```

## Backend

### Stack

| Component | Technology |
|---|---|
| Web framework | FastAPI 0.115 |
| MCP SDK | FastMCP 0.4 |
| ORM | SQLAlchemy 2.0 (async) |
| Database | SQLite via aiosqlite |
| Migrations | Alembic |
| Transport | Uvicorn + SSE |

### Endpoints

| Path | Protocol | Purpose |
|---|---|---|
| `/mcp/sse` | MCP SSE | AI clients connect here |
| `/mcp/messages/` | MCP JSON-RPC | Message exchange over SSE |
| `/health` | REST | Health check |
| `/api/*` | REST | Frontend CRUD (future) |

### MCP Tools

| Tool | Description |
|---|---|
| `run_pipeline(name, input, mode)` | Execute a named pipeline DAG |
| `list_pipelines()` | List available pipelines |
| `get_pipeline(id)` | Get a single pipeline definition |
| `create_pipeline(name, dag)` | Create a new pipeline |

### Lifespan

On startup, the backend initializes the SQLite database (creates tables if missing) and starts the SSE transport. The server is stateless beyond the database connection.

## Frontend

### Stack

| Component | Technology |
|---|---|
| Framework | React 18 |
| Build tool | Vite 5 |
| Graph canvas | React-Flow 12 |
| Routing | React Router 6 |
| State | Zustand |
| Server state | TanStack React Query |
| Styling | Tailwind CSS 3 |
| Icons | Lucide |

### Pages

| Route | Page | Description |
|---|---|---|
| `/` | Dashboard | Pipeline list, create new |
| `/workflows/:id` | WorkflowEditor | Canvas, NodePalette, NodeInspector |
| `/workflows/new` | WorkflowEditor | Empty canvas for new pipeline |
| `/settings` | Settings | MCP server config, model providers |

### Dev Proxy

Vite proxies `/api` and `/mcp` to the backend at `localhost:4333` during development. The built frontend uses `base: './'` for filesystem-based deployment (desktop app packaging).

## Deployment

### Docker

```bash
docker compose up --build
```

The Dockerfile uses a two-stage build:
1. Export Poetry dependencies to `requirements.txt`
2. Install into a slim Python 3.12 image
3. Copy backend code and `user_skills/` volume

The compose file mounts:
- `./user_skills/` → `/app/user_skills` (custom skill scripts)
- `./patchbay.db` → `/app/patchbay.db` (persistent database)

### Bare metal

```bash
make dev        # uvicorn on :4333
make frontend-dev  # vite on :5173
```

## Data Flow: Intercept

1. User sends a message in their AI editor
2. The editor's MCP client calls `run_pipeline(input, mode)` on Patchbay
3. Patchbay resolves the pipeline DAG for the given mode
4. The DAG is executed node by node (topological sort)
5. Each node transforms or augments the input
6. The final output is returned to the editor
7. The editor passes it to the model
8. The model's response is streamed back to the user

## Data Flow: Canvas

1. User drags nodes onto the canvas
2. Nodes are connected to form a DAG
3. The canvas serializes the DAG to JSON
4. The JSON is sent to the backend via REST API
5. The backend stores it in SQLite
6. On intercept, the backend deserializes the DAG and executes it
