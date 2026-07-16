# Pipeline Lifecycle

## The Full DAG Walk

Every user interaction that passes through Patchbay follows this lifecycle:

```
User input
    │
    ▼
1. CAPTURE ──► Collect input, identify mode, resolve pipeline
    │
    ▼
2. RESOLVE ──► Load DAG JSON, topological sort, validate graph
    │
    ▼
3. EXECUTE ──► Walk nodes in order, pass output as next input
    │  │  │
    │  ├── Context skills (transform input)
    │  ├── Model nodes (evaluate, generate)
    │  └── Tool nodes (read files, query APIs)
    │
    ▼
4. COLLECT ──► Gather final output, attach per-node metrics
    │
    ▼
5. RESPOND ──► Stream result back to caller
```

## Step by Step

### 1. Capture

The AI client (Claude Code, opencode, etc.) calls `run_pipeline(name, input, mode)` on Patchbay's MCP SSE endpoint. Patchbay receives:

```json
{
  "method": "run_pipeline",
  "params": {
    "name": "default-edit",
    "input": "add error handling to the login function",
    "mode": "edit"
  }
}
```

The server looks up the pipeline by name. If no name is provided, it falls back to the default for the given mode.

### 2. Resolve

The pipeline is stored as a JSON DAG:

```json
{
  "nodes": [
    { "id": "1", "type": "ponytail", "config": {} },
    { "id": "2", "type": "file_reader", "config": { "pattern": "**/login*" } },
    { "id": "3", "type": "model", "config": { "provider": "ollama", "model": "llama3" } },
    { "id": "4", "type": "validator", "config": {} }
  ],
  "edges": [
    { "from": "1", "to": "2" },
    { "from": "2", "to": "3" },
    { "from": "3", "to": "4" }
  ]
}
```

The server:
- Validates the graph is a proper DAG (no cycles)
- Runs topological sort to determine execution order
- Injects runtime context (session ID, project root, environment variables)

### 3. Execute

Each node is executed in topological order. The output of each node becomes the input of the next.

**Node types:**

| Node Type | Behavior | Example |
|---|---|---|
| **Context Skill** | Transforms text input | caveman (compresses), ponytail (formats) |
| **Model Node** | Sends input to an LLM and returns output | Ollama, Claude API |
| **MCP Tool** | Performs an action (read file, query API) | Local FS, GitHub CLI |
| **Router** | Branches the DAG based on conditions | If/else gates |
| **Utility** | Logs, metrics, transforms | Token counter, schema validator |

Each node receives:
- The accumulated input (original input + previous node outputs)
- Its own configuration (from the DAG JSON)
- Runtime context (environment, secrets, session info)

Each node returns:
- `output`: the transformed data
- `metrics`: tokens processed, execution time, status
- `errors`: if any

If a node errors, the pipeline can either halt or continue depending on its configuration.

### 4. Collect

After all nodes execute, Patchbay collects:

- The final transformed output
- Per-node execution metrics
- Total pipeline statistics (duration, tokens, node count)
- Any warnings or errors

```json
{
  "output": "refactored login function with error handling...",
  "metrics": {
    "total_duration_ms": 3420,
    "nodes_executed": 4,
    "total_tokens": 1542,
    "nodes": [
      { "id": "1", "type": "ponytail", "duration_ms": 12, "tokens": 30 },
      { "id": "2", "type": "file_reader", "duration_ms": 230, "tokens": 0 },
      { "id": "3", "type": "model", "duration_ms": 3100, "tokens": 1500 },
      { "id": "4", "type": "validator", "duration_ms": 78, "tokens": 12 }
    ]
  }
}
```

### 5. Respond

The result is returned to the caller through the SSE connection. The AI client passes the transformed output to the model, and the response is streamed back to the user.

```
User: "add error handling to the login function"
                                    │
Pipeline: ponytail → file_reader → model → validator
                                    │
                                    ▼
Model receives: "Add error handling to src/login.py:
                  [file contents appended]
                  Guidelines: ..."
                                    │
                                    ▼
Response: patched code with try/except blocks
```

## Error Handling

| Scenario | Behavior |
|---|---|
| Node execution fails | Pipeline halts, error returned to caller |
| Graph has cycle | Pipeline rejected at validation |
| Tool not available | Node skipped, warning logged |
| Timeout exceeded | Node cancelled, partial output returned |

## Performance Considerations

- Nodes execute sequentially within a single pipeline
- Long-running model nodes stream intermediate progress via SSE
- The SQLite cache can be used to memoize expensive node outputs
- Each pipeline invocation creates a new execution context (isolated state)
