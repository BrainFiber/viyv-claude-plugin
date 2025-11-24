# API Reference

## Core API (`@viyv-claude-plugin`)

### `createPluginManager()`

Create a plugin manager instance.

```typescript
import { createPluginManager } from '@viyv-claude-plugin';

const manager = await createPluginManager();
```

**Returns:** `Promise<ClaudePluginManager>`

---

## ClaudePluginManager

The main interface for managing plugins.

### `list(filter?)`

List all plugins with optional filtering.

```typescript
const plugins = await manager.list();

// Filter by tags
const filtered = await manager.list({ tags: ['knowledge', 'yext'] });
```

**Parameters:**
- `filter?` - Optional filter options
  - `tags?: string[]` - Filter by tags

**Returns:** `Promise<PluginMeta[]>`

### `get(id)`

Get a plugin by ID.

```typescript
const plugin = await manager.get('my-plugin');
if (plugin) {
  console.log(plugin.name);
}
```

**Parameters:**
- `id: string` - Plugin ID

**Returns:** `Promise<PluginMeta | undefined>`

### `create(input)`

Create a new plugin.

```typescript
const plugin = await manager.create({
  name: 'my-plugin',
  description: 'My awesome plugin',
  version: '1.0.0',
  skills: [
    {
      id: 'my-skill',
      content: '# My Skill\n\nContent...',
    },
  ],
  tags: ['demo', 'test'],
});
```

**Parameters:**
- `input: CreatePluginInput`
  - `name: string` - Plugin name (required)
  - `version?: string` - Version (default: `1.0.0`)
  - `description?: string` - Description
  - `skills?: SkillInput[]` - Initial skills (validated)
  - `tags?: string[]` - Tags

**Returns:** `Promise<PluginMeta>`

### `update(id, patch)`

Update an existing plugin.

```typescript
const updated = await manager.update('my-plugin', {
  description: 'Updated description',
  version: '1.1.0',
  tags: ['production'],
});
```

**Parameters:**
- `id: string` - Plugin ID
- `patch: UpdatePluginInput`
  - `name?: string` - New name
  - `version?: string` - New version
  - `description?: string` - New description
  - `skills?: SkillInput[]` - Replace all skills (validated)
  - `tags?: string[]` - New tags

**Returns:** `Promise<PluginMeta>`

### `delete(id, options?)`

Delete a plugin.

```typescript
await manager.delete('my-plugin');

// Force delete without confirmation
await manager.delete('my-plugin', { force: true });
```

**Parameters:**
- `id: string` - Plugin ID
- `options?`
  - `force?: boolean` - Skip confirmation

**Returns:** `Promise<void>`

### `importFromPath(input)`

Import a plugin from a local path.

```typescript
const plugin = await manager.importFromPath({
  path: './my-existing-plugin',
  name: 'imported-plugin',
  tags: ['imported'],
});
```

**Parameters:**
- `input: ImportFromPathInput`
  - `path: string` - Path to plugin directory
  - `name?: string` - Override plugin name
  - `tags?: string[]` - Add tags

**Returns:** `Promise<PluginMeta>`

### `importFromUrl(input)`

Import a plugin from a URL (zip).

```typescript
const plugin = await manager.importFromUrl({
  url: 'https://github.com/user/plugin/archive/main.zip',
  name: 'github-plugin',
  tags: ['github'],
});
```

**Parameters:**
- `input: ImportFromUrlInput`
  - `url: string` - URL to zip file
  - `name?: string` - Override plugin name
  - `tags?: string[]` - Add tags

**Returns:** `Promise<PluginMeta>`

---

## Agent SDK Adapter

### `createAgentSdkPluginAdapter(manager)`

Create an adapter for Claude Agent SDK.

```typescript
import { createPluginManager, createAgentSdkPluginAdapter } from '@viyv-claude-plugin';

const manager = await createPluginManager();
const adapter = createAgentSdkPluginAdapter(manager);
```

**Parameters:**
- `manager: ClaudePluginManager` - Plugin manager instance

**Returns:** `AgentSdkPluginAdapter`

### `adapter.getSdkPlugins(pluginIds)`

Convert plugin IDs to SDK plugin references.

```typescript
const sdkPlugins = await adapter.getSdkPlugins(['my-plugin', 'another-plugin']);

// Use with Agent SDK
const options = {
  plugins: sdkPlugins,
  // ... other options
};
```

**Parameters:**
- `pluginIds: string[]` - Array of plugin IDs

**Returns:** `Promise<SdkPluginRef[]>`

**Throws:** Error if any plugin is not found

---

## Types

### `PluginMeta`

Plugin metadata.

```typescript
type PluginMeta = {
  id: string;
  name: string;
  version: string;
  description?: string;
  location: string;
  source: PluginSource;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
};
```

### `PluginSource`

Plugin source information.

```typescript
type PluginSource =
  | { type: 'local'; path: string }
  | { type: 'url'; url: string }
  | { type: 'generated'; templateId?: string };
```

### `SkillInput`

Skill input for creating/updating plugins. Skills are validated against best-practice rules.

```typescript
type SkillFileInput = {
  path: string;     // relative to skills/<id>, max one subdirectory (e.g. "FORMS.md", "reference/guide.md")
  content: string;
};

type SkillInput = {
  id: string;       // lowercase letters/numbers/hyphens, <=64 chars, no reserved words ("anthropic","claude")
  content: string;  // SKILL.md with YAML frontmatter { name, description }
  files?: SkillFileInput[]; // optional supporting refs/scripts bundled with the skill
};
```

Validation rules:
- `id` must match `/^[a-z0-9-]{1,64}$/` and not contain reserved words.
- `SKILL.md` must start with frontmatter containing `name` and `description` (≤64 and ≤1024 chars respectively, no XML tags).
- File paths in `files` must be relative (no `..` or leading `/`), forward-slash only, and at most one nested directory.
- SKILL.md body must be ≤500 lines; split into references if longer.

### `SdkPluginRef`

Plugin reference for Claude Agent SDK.

```typescript
type SdkPluginRef = {
  type: 'local';
  path: string;
};
```

---

## Configuration

### `resolvePluginRoot()`

Resolve the plugin root directory.

```typescript
import { resolvePluginRoot } from '@viyv-claude-plugin';

const rootPath = await resolvePluginRoot();
console.log(`Plugins are stored in: ${rootPath}`);
```

**Returns:** `Promise<string>`

### `getDefaultPluginRoot()`

Get the default plugin root directory.

```typescript
import { getDefaultPluginRoot } from '@viyv-claude-plugin';

const defaultPath = getDefaultPluginRoot();
// Returns: ~/.viyv-claude/plugins
```

**Returns:** `string`
