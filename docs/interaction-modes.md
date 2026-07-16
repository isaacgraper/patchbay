# Interaction Modes

## Overview

Patchbay supports multiple interaction modes. Each mode defines a different pipeline that transforms user input before it reaches the AI model. The mode determines which skills, models, and tools are active.

## Mode Definitions

### plan

Use when discussing architecture, design, or approach. No code is written.

```
Input: "how should we restructure the auth module"
                                                    ┌─────────────────┐
Pipeline:  input → caveman → context gatherer ──► planner model ──► output
                                                    └─────────────────┘
Tools allowed: read-only (file search, grep, tree)
Tools blocked: write, execute, network
```

Use cases:
- Architecture discussions
- Code review (read-only)
- Debugging session planning
- Requirements gathering

### edit

Use when implementing, refactoring, or fixing code.

```
Input: "add input validation to the login handler"
                                                     ┌────────────────┐
Pipeline:  input → ponytail → file reader ──► coder model ──► validator ──► output
                                                     └────────────────┘
Tools allowed: read, write, execute
Tools blocked: destructive (rm -rf, force push)
```

Use cases:
- Feature implementation
- Bug fixes
- Refactoring
- Test writing

### chat

Use for casual conversation, Q&A, or exploration.

```
Input: "explain how FastMCP works"
                                           ┌─────────────┐
Pipeline:  input → compressor ──► chat model ──► output
                                           └─────────────┘
Tools allowed: read (limited)
Tools blocked: write, execute
```

Use cases:
- Asking questions
- Learning the codebase
- Quick exploration
- Documentation queries

### audit

Use for security review, linting, or quality checks.

```
Input: "check for SQL injection vulnerabilities"
                                                      ┌──────────────────┐
Pipeline:  input → linter → file reader ──► auditor model ──► reporter ──► output
                                                      └──────────────────┘
Tools allowed: read only
Tools blocked: write, execute, network
Output format: structured report (markdown or JSON)
```

Use cases:
- Security audits
- Code style enforcement
- Dependency review
- Performance analysis

## Mode Selection

Modes can be selected in three ways:

### 1. Explicit alias

The user prefixes their message with a mode alias:

```
pby:plan   how should we structure the database schema?
pby:edit   fix the type error in api.ts
pby:audit  review this pull request
```

### 2. Context detection

The assistant or Patchbay infers the mode from the message content:

- "design", "architecture", "plan" → plan mode
- "fix", "implement", "add", "refactor" → edit mode
- "explain", "what is", "how does" → chat mode

### 3. Default per project

Each project can set a default mode in its configuration. For example, a documentation project might default to chat mode.

## Configuration

Modes and their pipelines are configured through the Patchbay canvas. Each mode maps to a named pipeline:

```json
{
  "modes": {
    "plan": {
      "pipeline": "default-plan",
      "description": "Read-only design discussions"
    },
    "edit": {
      "pipeline": "default-edit",
      "description": "Code writing and modification"
    },
    "chat": {
      "pipeline": "default-chat",
      "description": "Casual Q&A"
    },
    "audit": {
      "pipeline": "default-audit",
      "description": "Code review and analysis"
    }
  }
}
```

Users can override individual mode pipelines from the canvas while keeping the mode structure intact.

## Custom Modes

Users can define their own modes beyond the four defaults:

```json
{
  "modes": {
    "deploy": {
      "pipeline": "deploy-check",
      "description": "Pre-deployment validation"
    },
    "doc": {
      "pipeline": "doc-generator",
      "description": "Generate documentation from code"
    }
  }
}
```

Custom modes support the same selection mechanisms (alias, context, default).
