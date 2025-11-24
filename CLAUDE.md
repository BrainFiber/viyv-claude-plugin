# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a pnpm monorepo for managing Claude-style plugins locally. The main package is `@viyv-claude-plugin` (packages/core), which provides a programmatic API for plugin CRUD operations, imports, and Claude Agent SDK integration.

## Common Commands

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run all tests
pnpm test

# Run tests for core package with coverage
pnpm --filter @viyv-claude-plugin test -- --coverage

# Run a single test file
pnpm --filter @viyv-claude-plugin test -- src/manager/ClaudePluginManagerImpl.test.ts

# Lint
pnpm lint

# Format
pnpm format

# Development mode (watch)
pnpm dev

# Run portal app
pnpm --filter portal dev
```

## Architecture

### Monorepo Structure

- `packages/core/` - Main library (`@viyv-claude-plugin`) - plugin management core
- `apps/portal/` - Next.js web UI for plugin management
- `examples/` - Usage examples (basic-usage, full-coverage)

### Core Package Architecture (packages/core/src/)

```
src/
├── index.ts              # Public API exports & createPluginManager factory
├── manager/              # ClaudePluginManagerImpl - main orchestrator
├── registry/             # RegistryManager - JSON-based plugin metadata storage
├── filesystem/           # PluginFileSystem, PluginImporter - file operations
├── adapter/              # AgentSdkPluginAdapter - Claude Agent SDK integration
├── config/               # resolver.ts - plugin root path resolution
├── types/                # TypeScript interfaces (plugin.ts, manager.ts, sdk.ts, registry.ts)
└── utils/                # atomic-write.ts, file-lock.ts
```

### Key Patterns

1. **Entry point**: Use `createPluginManager()` factory function to get a `ClaudePluginManager` instance
2. **Plugin storage**: Plugins stored in `~/.viyv-claude/plugins/` by default (configurable via `CLAUDE_PLUGIN_ROOT` env or config file)
3. **Plugin structure**: Each plugin has `.claude-plugin/plugin.json` for Claude compatibility
4. **ID generation**: Plugin IDs are slugified from names (lowercase, hyphens)

### Plugin Capabilities

Plugins can contain:
- `commands/` - Slash command markdown files
- `agents/` - Agent definition markdown files
- `hooks/hooks.json` - Hook configurations
- `.mcp.json` - MCP server configurations
- `skills/` - Skill markdown files
