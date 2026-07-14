[![CI](https://github.com/your-username/patchbay/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/patchbay/actions/workflows/ci.yml)
[![Python 3.12](https://img.shields.io/badge/python-3.12-blue.svg)](https://www.python.org/downloads/release/python-3120/)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-ready-2496ED.svg?logo=docker)](https://www.docker.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

**Visual Runtime Router for Model Context Protocol (MCP) servers and agentic pipelines.**

patchbay is an open-source, offline-first gateway that sits between local AI interfaces (Claude Code, Cline) and your tools, models, and custom skills. Instead of writing bespoke execution code for every workflow, you wire up nodes on a drag-and-drop canvas with triggers, context skills, language models, and MCP tool servers into directed acyclic graphs (DAGs) that run locally.

## How It Works

Watch demo video: (coming soon)

## MCP Server Ecosystem

patchbay works with any MCP-compatible server. Below are some of the tools and skills commonly used in patchbay pipelines. Custom skills can be placed in `user_skills/` and are volume-mounted into the Docker container.

| Server / Skill | Category | Description |
|---|---|---|
| **caveman** | Token Optimizer | Strips token bloat from context windows and enforces concise coding parameters |
| **ponytail** | Context Skill | Intercepts raw data chunks and applies strict formatting and filtering rules |
| **superpowers** | MCP Tool | Extended system, file, and network capabilities for agent runtimes |
| **Local FS** | MCP Tool | Read, write, and search local filesystem through JSON-RPC |
| **GitHub CLI** | MCP Tool | Repository management, PR operations, and issue tracking |
| **Hardware Translator** | MCP Tool | Bridges hardware byte streams and sensor data into structured inputs |
| **Local Llama 3** | Model Node | On-device inference via Ollama, no API key required |
| **Claude 3.5 Sonnet** | Model Node | Cloud-based reasoning routed through MCP |
| **Context Compressor** | Pipeline Utility | Reduces prompt size by summarizing prior turns |
| **Token Budget Enforcer** | Pipeline Utility | Tracks and limits token consumption across pipeline steps |

Adding a new server requires no changes, just wire it up in the visual editor and point it at any MCP-compatible endpoint.

---

## Why patchbay?

| Without patchbay | With patchbay |
|---|---|
| Manually code every tool integration | Drag and drop nodes onto a visual graph |
| Scattered configs across files | Single MCP SSE endpoint at localhost:4333 |
| No runtime visibility | Real-time execution metrics and logs |
| Hard to reuse workflow logic | Save, fork, and version pipelines as JSON DAGs |
| Tightly coupled to one AI client | Works with any MCP-compatible client |

---

## Quick Start

```bash
# Prerequisites: Python 3.12+, Poetry, Node.js 20+, Docker (optional)

git clone https://github.com/your-username/patchbay.git
cd patchbay

cp .env.example .env
make install          # poetry install + pre-commit hooks
make frontend-install # npm install

# Terminal 1: Backend (port 4333)
make dev

# Terminal 2: Frontend (port 5173)
make frontend-dev

# Or use Docker:
make docker-up
```

---

## MCP Client Configuration

Point any MCP-compatible client to patchbay's SSE endpoint:

**Claude Desktop / Claude Code (`claude_desktop_config.json` or `.mcp.json`):**

```json
{
  "mcpServers": {
    "patchbay": {
      "url": "http://localhost:4333/mcp/sse"
    }
  }
}
```

Once connected, the client discovers the `run_pipeline` tool and any other tools registered on the patchbay server.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup instructions, code style guidelines, and the pull request process.

---

## License

[MIT](LICENSE)
