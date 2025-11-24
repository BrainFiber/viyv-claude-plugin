# viyv-claude-plugin-core

Claude Code 用プラグインを管理するための Node.js コアライブラリです。

## インストール

```bash
npm install viyv-claude-plugin-core
# または
pnpm add viyv-claude-plugin-core
```

## 基本の使い方

```ts
import { createPluginManager } from 'viyv-claude-plugin-core';

const manager = await createPluginManager();

// プラグイン作成
const plugin = await manager.create({
  name: 'calculator',
  description: 'Simple math helper',
  skills: [{ id: 'add', content: '# Add\nUse this to add two numbers.' }],
});

// 取得・一覧
await manager.get(plugin.id);
await manager.list();

// 更新
await manager.update(plugin.id, { description: 'Updated' });

// 削除
await manager.delete(plugin.id);
```

## Claude Agent SDK との連携

```ts
import { createAgentSdkPluginAdapter, createPluginManager } from 'viyv-claude-plugin-core';

const manager = await createPluginManager();
const adapter = createAgentSdkPluginAdapter(manager);
const plugins = await adapter.getSdkPlugins(['calculator']);
```

## 関連パッケージ

- [viyv-claude-plugin](https://www.npmjs.com/package/viyv-claude-plugin) - CLI ツール

## ライセンス

MIT
