# Getting Started (Library Only)

## Install

```bash
pnpm install
pnpm --filter @viyv-claude-plugin build
```

### Use the library

```typescript
import { createPluginManager } from '@viyv-claude-plugin';

const manager = await createPluginManager();

// create a plugin
const plugin = await manager.create({
  name: 'hello-world',
  description: 'Minimal demo plugin',
  tags: ['demo'],
  skills: [{ id: 'greet', content: '# Greet\n\nSay hello.' }],
});

console.log('created', plugin.id, plugin.location);

// list plugins
console.log(await manager.list());
```

## Where data is stored

- Registry file: `~/.viyv-claude/plugins/registry.json`
- Plugin contents: `~/.viyv-claude/plugins/plugins/<plugin-id>/`

`createPluginManager()` resolves these paths automatically. To change the root, set `VIYV_CLAUDE_PLUGIN_ROOT` or create `~/.viyv-claude/config.json`:

```json
{
  "pluginRoot": "/custom/path/plugins"
}
```

## Next steps

- See the [API リファレンス](./api-reference.md) for all available methods.
- Check `examples/basic-usage` for a runnable sample.
