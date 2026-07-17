# MCP Client Configuration

## Overview

Patchbay exposes an MCP SSE endpoint at `http://localhost:4333/mcp/sse`. Any MCP-compatible client can connect and discover its tools.

## Connection Details

| Property | Value |
|---|---|
| Endpoint | `http://localhost:4333/mcp/sse` |
| Protocol | MCP over SSE |
| Transport | Server-Sent Events |
| Message format | JSON-RPC 2.0 |

## Client Configuration

### Claude Code

Create or edit `.mcp.json` in your project root:

```json
{
  "mcpServers": {
    "patchbay": {
      "url": "http://localhost:4333/mcp/sse"
    }
  }
}
```

### opencode

Add the server to your opencode configuration file:

```json
{
  "mcpServers": {
    "patchbay": {
      "url": "http://localhost:4333/mcp/sse"
    }
  }
}
```

### Cline

Add the server to your Cline MCP settings file:

```json
{
  "mcpServers": {
    "patchbay": {
      "url": "http://localhost:4333/mcp/sse"
    }
  }
}
```

### Claude Desktop

Edit `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "patchbay": {
      "url": "http://localhost:4333/mcp/sse"
    }
  }
}
```

### curl (testing)

```bash
# SSE stream
curl -N http://localhost:4333/mcp/sse

# Health check
curl http://localhost:4333/health
```

## Tool Discovery

On connection, clients call `tools/list` and receive:

```json
{
  "tools": [
    {
      "name": "run_pipeline",
      "description": "Execute a named pipeline DAG",
      "inputSchema": {
        "type": "object",
        "properties": {
          "name": { "type": "string", "description": "Pipeline name" },
          "input": { "type": "string", "description": "Input data" },
          "mode": {
            "type": "string",
            "enum": ["plan", "edit", "chat", "audit"],
            "default": "edit"
          }
        },
        "required": ["input"]
      }
    },
    {
      "name": "list_pipelines",
      "description": "List all available pipelines",
      "inputSchema": { "type": "object", "properties": {} }
    }
  ]
}
```

## Use Case: Mode Selection

Once connected, users interact with Patchbay pipelines through their AI client. The mode determines which pipeline runs.

**Explicit mode with `pby` alias (future):**

```
pby:plan   how should we structure the database?
pby:edit   fix the type error in api.ts
pby:audit  review this pull request
```

The AI client recognizes the `pby:` prefix and calls `run_pipeline` with the appropriate mode before passing the result to the model.

**Implicit mode:**

The AI client can also be configured to call Patchbay on every interaction, using context detection to select the mode automatically.

## Connecting Multiple Clients

Multiple AI clients can connect to the same Patchbay instance simultaneously. Each SSE connection is independent. Pipelines, sessions, and state are isolated per connection.

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| Connection refused | Patchbay not running | Run `make dev` or `docker compose up` |
| 404 on SSE | Wrong path | Use `/mcp/sse`, not `/sse` |
| No tools discovered | Wrong endpoint | Verify the URL includes `/mcp` |
| Tools respond slowly | Pipeline execution in progress | Check node durations in metrics |
| CORS errors | Frontend not proxying | Use Vite proxy, not direct browser calls |

## Future: pby CLI

A separate project (`pby`) will eventually automate writing these configuration files:

```bash
pipx install pby
cd my-project
pby init
```

This creates the `.mcp.json` file with the correct URL for the local Patchbay instance. See `project-memory.md` for the rationale behind keeping this separate.
