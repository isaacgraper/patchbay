# Concept: Pre-commit for AI

## The Fragmentation Problem

Every AI-assisted coding tool has its own way of injecting context, rules, and skills:

- Claude Code uses `.claude/rules/` and project-level instructions
- Cursor has `.cursorrules`
- Cline uses `.clinerules`
- Custom workflows rely on scattered `.mdc` files, markdown docs, and shell scripts
- Token optimization tricks (caveman, ponytail, superpowers) are duplicated across every tool

None of these share a common runtime. A skill written for one tool cannot be reused in another. Maintaining N copies of the same logic across N tools is unsustainable.

## The Intercept Layer

Patchbay solves this by inserting itself between the user and the model:

```
User input
     │
     ▼
  ┌─────────────────────┐
  │     Patchbay        │─── executes a pipeline (DAG of skills, models, tools)
  │  intercept layer    │
  └─────────┬───────────┘
            │
            ▼
  ┌─────────────────────┐
  │    AI Model         │
  │ (local or cloud)    │
  └─────────┬───────────┘
            │
            ▼
     Response
```

Every user message passes through a configurable pipeline before reaching the model. The pipeline can:
- Rewrite or compress the input (caveman token reduction)
- Enforce formatting constraints (ponytail)
- Inject project context from the filesystem
- Route to different models depending on intent
- Gate or block certain types of requests

## Pre-commit for AI

The name comes from a simple analogy:

| git pre-commit | Patchbay |
|---|---|
| Runs before every commit | Runs before every AI interaction |
| Lints, formats, checks | Compresses, routes, enriches |
| Enforces project conventions | Enforces interaction conventions |
| Configurable per repo | Configurable per pipeline mode |

Just as pre-commit hooks make `git commit` safer and more consistent, Patchbay makes every AI interaction safer and more consistent.

## Mode-Based Routing

Different tasks need different pipelines. Patchbay supports multiple interaction modes:

| Mode | Typical Pipeline | Behavior |
|---|---|---|
| **plan** | caveman → context gatherer → planner model → no-write tools | Discuss design, never modify files |
| **edit** | ponytail → file reader → coder model → output validator | Write and modify code |
| **chat** | token compressor → context summarizer → chat model | Casual conversation, lightweight |
| **audit** | linter → file reader → reviewer model → report generator | Review code, never write |

The mode can be selected explicitly (alias like `pby:plan`), via context detection, or configured as a default per project.

## One Runtime, Any Client

Because Patchbay speaks standard MCP over SSE, any MCP-compatible client can use it:

- Claude Code
- opencode
- Cline
- Custom scripts

Skills are defined once in the visual canvas and reused across all clients. No more copies.

## Key Tenets

- **Offline-first** — all pipelines run locally, no cloud dependency
- **Visual by default** — pipelines are drawn, not coded
- **Intercept by design** — Patchbay is always between you and the model
- **Client-agnostic** — any MCP tool can connect
- **Mode-driven** — one canvas, many interaction styles
