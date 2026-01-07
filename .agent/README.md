# Agent Working System

This directory contains a stateless agent working system that enables any AI agent to understand the project state and continue development work without needing context from previous sessions.

## Directory Structure

```
.agent/
├── README.md                 # This file - system overview
├── GETTING_STARTED.md        # Quick start guide for agents
├── AGENT_PROMPT.md          # Universal prompt for new agent sessions
├── project-status.md        # Current project state and progress
└── tasks/                   # Task management
    └── README.md            # Task index and status
```

## Key Principles

1. **Stateless**: Every file contains complete information without assuming prior knowledge
2. **Self-Documenting**: Agents learn by reading files in the repository
3. **Version Controlled**: All task updates are committed to git
4. **Transparent**: Clear documentation of decisions and progress

## Quick Start for Agents

1. Read `GETTING_STARTED.md` for workflow instructions
2. Check `project-status.md` for current state
3. Review `tasks/README.md` for available work
4. Execute tasks following the documented process
5. Update documentation as you work

## For Human Project Owners

To assign work to an agent:

1. Create or update task files in `.agent/tasks/`
2. Update `tasks/README.md` with task status
3. Provide the agent with `AGENT_PROMPT.md` as initial context
4. The agent will read repository state and begin work

## System Benefits

- Agents can pick up work at any time
- No need to regenerate prompts for each session
- Clear audit trail of all decisions and changes
- Easy handoff between different agents
- Project knowledge lives in the repository
