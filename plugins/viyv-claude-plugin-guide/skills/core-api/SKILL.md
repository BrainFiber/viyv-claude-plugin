---
name: core-api
description: Provides TypeScript API guide for viyv-claude-plugin programmatic usage. Auto-invoke when user mentions: createPluginManager, TypeScript API, programmatic plugin management, @viyv-claude-plugin package. Do NOT use for: CLI commands, plugin file structure.
---
# Core API プログラミングガイド

`@viyv-claude-plugin` パッケージを使用してプログラムからプラグインを管理できます。

## インストール

```bash
npm install @viyv-claude-plugin
```

## 基本的な使い方

```typescript
import { createPluginManager } from '@viyv-claude-plugin';

async function main() {
  // マネージャーインスタンスを作成
  const manager = await createPluginManager();

  // プラグイン一覧を取得
  const plugins = await manager.list();
  console.log(plugins);
}

main();
```

## ClaudePluginManager API

### list(filter?) - プラグイン一覧

```typescript
// 全プラグイン
const all = await manager.list();

// フィルタリング
const filtered = await manager.list({
  tags: ['utility'],
  search: 'helper'
});
```

### get(id) - プラグイン取得

```typescript
const plugin = await manager.get('my-plugin');
if (plugin) {
  console.log(plugin.name, plugin.version);
}
```

### create(input) - プラグイン作成

```typescript
const newPlugin = await manager.create({
  name: 'My New Plugin',
  description: 'A useful plugin',
  version: '1.0.0',
  author: {
    name: 'Your Name',
    email: 'you@example.com'
  },
  skills: [
    {
      id: 'my-skill',
      name: 'My Skill',
      description: 'Does something useful',
      content: '# My Skill\n\nSkill content here...'
    }
  ],
  commands: [
    {
      name: 'my-command',
      description: 'Runs my command',
      content: '# Command\n\nCommand instructions...'
    }
  ]
});
```

### update(id, patch) - プラグイン更新

```typescript
const updated = await manager.update('my-plugin', {
  description: 'Updated description',
  version: '1.1.0'
});
```

### delete(id, options?) - プラグイン削除

```typescript
// 通常削除
await manager.delete('my-plugin');

// 強制削除
await manager.delete('my-plugin', { force: true });
```

### importFromPath(input) - パスからインポート

```typescript
const imported = await manager.importFromPath({
  sourcePath: './path/to/plugin',
  force: false  // 既存を上書きしない
});
```

### importFromUrl(input) - URLからインポート

```typescript
// GitHubから
const fromGitHub = await manager.importFromUrl({
  url: 'https://github.com/user/plugin-repo',
  ref: 'main'  // ブランチ/タグ/コミット
});

// ZIPファイルから
const fromZip = await manager.importFromUrl({
  url: 'https://example.com/plugin.zip'
});
```

## CreatePluginInput 型

```typescript
type CreatePluginInput = {
  name: string;
  version?: string;
  description?: string;
  author?: {
    name: string;
    email?: string;
    url?: string;
  };
  homepage?: string;
  repository?: string;
  license?: string;
  keywords?: string[];
  skills?: SkillInput[];
  commands?: CommandInput[];
  agents?: AgentInput[];
  hooks?: HooksInput;
  mcpServers?: McpServersInput;
  tags?: string[];
};
```

## 設定

プラグインの保存先は以下の優先順位で決定:

1. 環境変数 `CLAUDE_PLUGIN_ROOT`
2. 設定ファイル
3. デフォルト: `~/.viyv-claude/plugins/`

```bash
# 環境変数で指定
export CLAUDE_PLUGIN_ROOT=/path/to/plugins
```

## エラーハンドリング

```typescript
try {
  await manager.create({ name: '' }); // 不正な入力
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Validation failed:', error.message);
  }
}
```

## Claude Agent SDK 連携

`AgentSdkPluginAdapter` を使用してAgent SDKと連携可能:

```typescript
import { AgentSdkPluginAdapter } from '@viyv-claude-plugin';

const adapter = new AgentSdkPluginAdapter(manager);
// Agent SDKでプラグインを利用
```
