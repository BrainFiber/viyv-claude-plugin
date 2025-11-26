# viyv-claude-plugin

Claude Code 用プラグインをローカルで管理するための Node.js ライブラリおよび CLI ツールです。

## ✨ 特徴

- 🎯 プラグインIDで管理し、パス解決を自動化
- 📦 CRUD・インポート・スキル管理をワンストップで提供
- ✅ `.claude-plugin/plugin.json` を正しく生成し、Claude互換の構造を保証
- 🔌 Claude Agent SDK などに渡せるローカルパス配列へ変換するアダプタを同梱
- 🛠️ CLI ツールでプラグインの作成・インストール・管理を簡単に

## 📦 パッケージ構成

| パッケージ | 説明 |
|-----------|------|
| `viyv-claude-plugin-core` | コアライブラリ（プラグイン管理API） |
| `viyv-claude-plugin` | CLI ツール（プラグイン作成・インストール・管理） |

## 🚀 クイックスタート

### CLI でプラグインを作成

```bash
# 新規プラグインプロジェクトを作成
npx viyv-claude-plugin new my-plugin

# Claude Code にマーケットプレイスを登録
npx viyv-claude-plugin setup

# プラグインを編集後、更新を反映
npx viyv-claude-plugin update
```

### 既存プラグインをインストール

```bash
# GitHub からインストール
npx viyv-claude-plugin install github:user/repo

# ローカルディレクトリからインストール
npx viyv-claude-plugin install ./path/to/plugin

# マーケットプレイスから全プラグインをインストール
npx viyv-claude-plugin install ./marketplace
```

---

## 🛠️ CLI コマンド一覧

### プロジェクト作成

```bash
npx viyv-claude-plugin new <name> [options]
```

新規プラグインプロジェクト（マーケットプレイス + プラグイン）を作成します。

| オプション | 説明 |
|-----------|------|
| `--dir <path>` | 作成先ディレクトリ |
| `--description <text>` | プラグインの説明 |
| `--version <version>` | バージョン（デフォルト: 0.0.1） |
| `--author-name <name>` | 作者名 |
| `--author-email <email>` | 作者メール |
| `--force` | 既存ファイルを上書き |

**生成されるファイル構造:**

```
<current-dir>/
├── .claude-plugin/
│   └── marketplace.json       # マーケットプレイス定義
└── plugins/
    └── <plugin-name>/
        ├── .claude-plugin/
        │   └── plugin.json    # プラグインメタデータ
        ├── commands/          # スラッシュコマンド
        ├── agents/            # エージェント定義
        ├── skills/            # スキル
        ├── hooks/             # フック設定
        └── .mcp.json          # MCP サーバー設定
```

### マーケットプレイス管理

```bash
# Claude Code にマーケットプレイスを登録
npx viyv-claude-plugin setup [-p <path>] [-n <name>]

# 登録済みマーケットプレイスを削除
npx viyv-claude-plugin uninstall [-n <name>]

# マーケットプレイスを更新（変更を反映）
npx viyv-claude-plugin update [path]
```

### プラグイン管理

```bash
# インストール済みプラグイン一覧
npx viyv-claude-plugin list

# プラグインをインストール
npx viyv-claude-plugin install <source> [name...] [options]

# プラグインを削除
npx viyv-claude-plugin remove <id>

# プラグインを更新
npx viyv-claude-plugin update-plugin <id>
```

**install コマンドのソースタイプ:**

| タイプ | 例 |
|-------|-----|
| ローカルディレクトリ | `./path/to/plugin` |
| ZIP ファイル | `./plugin.zip` |
| GitHub (HTTPS) | `https://github.com/user/repo` |
| GitHub (短縮形) | `github:user/repo` |
| Git URL | `git@github.com:user/repo.git` |

**install コマンドのオプション:**

| オプション | 説明 |
|-----------|------|
| `--all` | 全プラグインをインストール（デフォルト動作） |
| `--ref <ref>` | Git ブランチ/タグ/コミット |
| `--force` | 既存プラグインを上書き |
| `--dry-run` | 実行内容を表示のみ |

---

## 🔧 コアライブラリ API

### インストール

```bash
npm install viyv-claude-plugin-core
# または
pnpm add viyv-claude-plugin-core
```

### 基本の使い方

```ts
import { createPluginManager } from 'viyv-claude-plugin-core';

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
  name: 'remote-plugin',
  tags: ['remote'],
});
```

### Claude Agent SDK との連携

```ts
import { createAgentSdkPluginAdapter, createPluginManager } from 'viyv-claude-plugin-core';
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

---

## 📁 プラグイン構造

プラグインは以下の構造を持ちます：

```
plugin-name/
├── .claude-plugin/
│   └── plugin.json      # 必須: プラグインメタデータ
├── commands/            # スラッシュコマンド（*.md）
├── agents/              # エージェント定義（*.md）
├── skills/              # スキル（*/SKILL.md）
├── hooks/
│   └── hooks.json       # フック設定
└── .mcp.json            # MCP サーバー設定
```

### plugin.json

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "プラグインの説明"
}
```

### スキルファイル (SKILL.md)

```markdown
---
name: skill-name
description: Provides [機能]. Auto-invoke when user mentions: [キーワード]. Do NOT use for: [除外].
---
# スキル名

スキルの内容...
```

**スキル description のベストプラクティス:**

- 三人称で記述: `"Provides..."`, `"Analyzes..."`
- 自動呼び出しトリガー: `"Auto-invoke when user mentions: [keywords]"`
- 除外条件: `"Do NOT use for: [exclusions]"`

例:
```
description: Provides file placement rules and structure for skill files. Auto-invoke when user mentions: skill, SKILL.md, add skill, create skill, edit skill. Do NOT use for: commands, agents, hooks.
```

---

## 🔧 設定

プラグインはデフォルトで `~/.viyv-claude/plugins/` に配置されます。

**優先順位:**
1. 環境変数 `CLAUDE_PLUGIN_ROOT`
2. `~/.viyv-claude/config.json` の `pluginRoot`
3. デフォルト（`~/.viyv-claude/`）

```json
{
  "pluginRoot": "/custom/plugins"
}
```

---

## 🧪 テスト

```bash
# 全テスト実行
pnpm test

# カバレッジ付き
pnpm --filter viyv-claude-plugin-core test -- --coverage
```

---

## 📑 サンプル

| ディレクトリ | 説明 |
|-------------|------|
| `examples/basic-usage/` | 最小限の作成/更新/削除フロー |
| `examples/full-coverage/` | commands/agents/hooks/MCP/skills のフル機能デモ |
| `examples/default-path/` | デフォルトパスでのプラグイン管理 |
| `examples/multi-plugins/` | 複数プラグインの管理 |

---

## 🗂 プロジェクト構造

```
viyv-claude-plugin/
├── packages/
│   ├── core/            # viyv-claude-plugin-core（コアライブラリ）
│   └── cli/             # viyv-claude-plugin（CLI ツール）
├── plugins/
│   └── viyv-claude-plugin-guide/  # プラグイン開発ガイド
├── examples/            # サンプルコード
└── docs/                # ドキュメント
```

---

## ライセンス

MIT
