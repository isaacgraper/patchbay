**Visual Runtime Router for MCP Servers & Agentic Pipelines**

Patchbay is an open-source, offline-first, Dockerized visual runtime router for [Model Context Protocol (MCP)](https://modelcontextprotocol.io) servers and agentic pipelines. It acts as an intermediary gateway between local AI interfaces (Claude Code, Cline, etc.) and the fragmented world of custom skills, token compressors, and low-level system tools.

Instead of writing custom execution code for every workflow, Patchbay lets you wire up models, context parameters, and external APIs into an intuitive visual graph, creating pipelines for every interaction with your favorite model.

## Quick Start

### Prerequisites

- Python 3.12+
- [Poetry](https://python-poetry.org/docs/#installation) (`pipx install poetry`)
- Node.js 20+
- Docker (optional, for containerized deployment)

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/patchbay.git
cd patchbay

# Backend setup
cp .env.example .env
make install

# Frontend setup
make frontend-install
```

### Development

```bash
# Backend
make dev

# Frontend
make frontend-dev
```

The frontend dev server runs on `http://localhost:5173` and proxies API calls to the backend on port `4333`.

### Docker Deployment

```bash
make docker-up
```

---

### MCP Client Configuration

Point your MCP client (Claude Code, Codex, Cursor) to Patchbay's SSE endpoint:

```json
{
  "mcpServers": {
    "patchbay": {
      "url": "http://localhost:4333/mcp/sse"
    }
  }
}
```

---

## License

MIT
