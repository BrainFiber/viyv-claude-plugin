# viyv-claude-plugin

Claude 仕様のプラグインをローカルで管理するための Node.js ライブラリです。  
CLI 配布は行わず、`@viyv-claude-plugin`（コアライブラリ）のみ提供しています。

## ✨ 特徴
- 🎯 プラグインIDで管理し、パス解決を自動化
- 📦 CRUD・インポート・スキル管理をワンストップで提供
- ✅ `.claude-plugin/plugin.json` を正しく生成し、Claude互換の構造を保証
- 🔌 Claude Agent SDK などに渡せるローカルパス配列へ変換するアダプタを同梱

## 📦 インストール
```bash
pnpm install
pnpm --filter @viyv-claude-plugin build   # 型付きビルドを出力
```

## 🔧 基本の使い方
```ts
import { createPluginManager } from '@viyv-claude-plugin';

const manager = await createPluginManager();

// 作成
const plugin = await manager.create({
  name: 'calculator',
  description: 'Simple math helper',
  tags: ['demo'],
  skills: [{ id: 'add', content: '# Add\nUse this to add two numbers.' }],
});

// 取得・一覧
await manager.get(plugin.id);
await manager.list({ tags: ['demo'] });

// 更新
await manager.update(plugin.id, {
  description: 'Updated desc',
  version: '1.1.0',
  skills: [{ id: 'add', content: '# Add\nUpdated content.' }],
});

// 削除
await manager.delete(plugin.id);
```

### 既存プラグインの取り込み
```ts
// ローカルディレクトリから
await manager.importFromPath({ path: '/path/to/plugin', tags: ['imported'] });

// ZIP URL から
await manager.importFromUrl({
  url: 'https://example.com/my-plugin.zip',
  name: 'remote-plugin',   // 省略時は plugin.json の name を使用
  tags: ['remote'],
});
```

### Claude Agent SDK との連携
```ts
import { createAgentSdkPluginAdapter, createPluginManager } from '@viyv-claude-plugin';
import { query } from '@anthropic-ai/claude-agent-sdk';

const manager = await createPluginManager();
const adapter = createAgentSdkPluginAdapter(manager);
const plugins = await adapter.getSdkPlugins(['calculator']);

for await (const message of query({
  prompt: '/calculator:add 2 + 3',
  options: { model: 'claude-3-5-sonnet-20241022', plugins },
})) {
  // handle stream
}
```

## 🔧 設定（保存先パス）
プラグインはデフォルトで `~/.viyv-claude/plugins/` に配置されます。優先順位:
1. 環境変数 `CLAUDE_PLUGIN_ROOT`
2. `~/.viyv-claude/config.json` の `pluginRoot`
3. `CLAUDE_HOME` / `HOME` / `USERPROFILE` から導かれるデフォルト

例: 設定ファイルでルート変更
```json
{
  "pluginRoot": "/custom/plugins"
}
```

## 🧪 テスト
```bash
pnpm --filter @viyv-claude-plugin test -- --coverage
# 100% funcs / 99.6% lines（2025-11 時点）
```

## 📑 サンプル
- `examples/basic-usage/` … 最小限の作成/更新/削除フロー
- `examples/full-coverage/` … commands / agents / hooks / MCP / skills まで含むフル機能デモ（`pnpm --filter full-coverage-example start`）

## 🗂 プロジェクト構造
```
viyv-claude-plugin/
├── packages/
│   └── core/            # パッケージ名: @viyv-claude-plugin
├── examples/
│   └── basic-usage/     # 最小サンプル
└── docs/                # Getting Started / API リファレンス
```

## ライセンス
MIT
