---
name: plugin-structure
description: Provides directory structure and file placement rules for plugins and marketplaces. Auto-invoke when user mentions: plugin structure, directory layout, marketplace structure, where to place files, plugin organization, new plugin, marketplace.json. Do NOT use for: specific component creation (use skill-crud, command-crud, etc.).
---
# プラグインディレクトリ構造

viyv-claude-pluginで管理するプラグインの構造を解説します。

## プラグインルートディレクトリとは

**プラグインルートディレクトリ**とは、`.claude-plugin/plugin.json` が存在するディレクトリです。
すべてのプラグインコンポーネント（skills, commands, agents等）は、このプラグインルート内に作成します。

```
plugins/
└── get-weather/              ← これがプラグインルートディレクトリ
    ├── .claude-plugin/
    │   └── plugin.json       ← このファイルがあるディレクトリの親
    ├── skills/
    ├── commands/
    └── ...
```

**重要**: ファイルを作成する際は、必ず対象プラグインのルートディレクトリ内に作成してください。
プロジェクトルートや他の場所には作成しないでください。

## 基本構造

```
plugins/<plugin-name>/          # プラグインルートディレクトリ
├── .claude-plugin/
│   └── plugin.json             # [必須] プラグインメタデータ
├── commands/                   # スラッシュコマンド
│   └── *.md
├── agents/                     # エージェント定義
│   └── *.md
├── skills/                     # スキル定義
│   └── <skill-id>/
│       └── SKILL.md
├── hooks/
│   └── hooks.json              # フック設定
├── .mcp.json                   # MCPサーバー設定
└── README.md                   # プラグイン説明
```

### 具体例: get-weather プラグイン

```
plugins/get-weather/                              # プラグインルート
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   └── weather-forecast/
│       └── SKILL.md                              # plugins/get-weather/skills/weather-forecast/SKILL.md
├── commands/
│   └── check-weather.md                          # plugins/get-weather/commands/check-weather.md
└── README.md
```

## デフォルトディレクトリの自動ロード

Claude Code は以下のデフォルトディレクトリを**自動的に検出してロード**します：

| コンポーネント | デフォルト位置 | 説明 |
|--------------|--------------|------|
| コマンド | `commands/` | スラッシュコマンドの.mdファイル |
| エージェント | `agents/` | エージェント定義の.mdファイル |
| スキル | `skills/` | SKILL.mdを含むサブディレクトリ |
| フック | `hooks/hooks.json` | フック設定ファイル |
| MCPサーバー | `.mcp.json` | MCPサーバー定義 |

**重要**: これらのデフォルトディレクトリは `plugin.json` で明示的に指定しなくても自動的にロードされます。

### カスタムパスは「補足」であり「置換」ではない

`plugin.json` でカスタムパスを指定した場合、それは**デフォルトディレクトリに追加される**ものであり、**置換するものではありません**。

## 各ディレクトリの役割

### `.claude-plugin/plugin.json` (必須)

プラグインのメタデータを定義するJSON。これがないとプラグインとして認識されません。

### `commands/` (自動ロード)

スラッシュコマンドのMarkdownファイルを配置。Claude Codeで `/コマンド名` で呼び出せます。

### `agents/` (自動ロード)

エージェント定義のMarkdownファイルを配置。特定タスクに特化したAIエージェントを定義できます。

### `skills/` (自動ロード)

スキル定義を配置。各スキルは独自のディレクトリを持ち、`SKILL.md` ファイルが必須です。
スキルはClaude Codeが文脈に応じて自動的に呼び出す知識ベースです。

### `hooks/hooks.json` (自動ロード)

フック（イベントトリガー）を設定。SessionStart、PostToolUseなどのイベントで処理を実行できます。
**注意**: `plugin.json` で `hooks/hooks.json` を指定すると重複エラーになります。

### `.mcp.json` (自動ロード)

Model Context Protocol (MCP) サーバーの設定。外部ツールとの連携を定義します。

## マーケットプレイス構造

複数プラグインを管理する場合：

```
<marketplace>/
├── .claude-plugin/
│   └── marketplace.json        # マーケットプレイスメタデータ
└── plugins/
    ├── plugin-a/               # プラグインルート
    │   └── .claude-plugin/plugin.json
    └── plugin-b/               # プラグインルート
        └── .claude-plugin/plugin.json
```

### マーケットプレイスとプラグインの見分け方

| ファイル | 意味 |
|---------|------|
| `.claude-plugin/marketplace.json` | **マーケットプレイス**：複数プラグインのコンテナ |
| `.claude-plugin/plugin.json` | **プラグイン**：単独のプラグイン |

### マーケットプレイスにコンポーネントを作成しない

**重要**: マーケットプレイスのルートには `skills/`, `commands/`, `agents/` などのコンポーネントを作成できません。必ず `plugins/` 配下のプラグイン内に作成してください。

```
❌ 間違い（マーケットプレイスルートに作成）
<marketplace>/
├── .claude-plugin/marketplace.json
├── skills/                      ← ここに作成してはいけない
└── plugins/

✅ 正しい（プラグイン内に作成）
<marketplace>/
├── .claude-plugin/marketplace.json
└── plugins/
    └── my-plugin/
        ├── .claude-plugin/plugin.json
        └── skills/              ← ここに作成する
```

## 新規プラグイン作成時の手順（マーケットプレイス環境）

**重要**: マーケットプレイス環境で新しいプラグインを作成する場合、以下の**両方**が必要です：

1. プラグインディレクトリと `plugin.json` を作成
2. **`marketplace.json` にプラグインを登録**

### 手順

#### Step 1: プラグインディレクトリを作成

```
plugins/new-plugin/
├── .claude-plugin/
│   └── plugin.json
└── (skills/, commands/, etc.)
```

#### Step 2: marketplace.json にプラグインを登録（必須）

`.claude-plugin/marketplace.json` の `plugins` 配列に新しいプラグインを追加：

```json
{
  "name": "my-marketplace",
  "plugins": [
    {
      "name": "existing-plugin",
      "source": "./plugins/existing-plugin"
    },
    {
      "name": "new-plugin",
      "source": "./plugins/new-plugin"
    }
  ]
}
```

### marketplace.json の構造

```json
{
  "name": "marketplace-name",
  "owner": {
    "name": "Owner Name",
    "email": "owner@example.com"
  },
  "plugins": [
    {
      "name": "plugin-name",
      "source": "./plugins/plugin-name",
      "description": "Optional description",
      "version": "1.0.0"
    }
  ]
}
```

#### plugins 配列の各エントリ

| フィールド | 必須 | 説明 |
|-----------|------|------|
| `name` | 必須 | プラグイン名 |
| `source` | 必須 | プラグインディレクトリへの相対パス |
| `description` | オプション | プラグインの説明 |
| `version` | オプション | バージョン |

### よくある間違い

```
❌ marketplace.json を更新し忘れる
→ プラグインディレクトリを作成しても、marketplace.json に登録しないと認識されない

❌ source パスが間違っている
→ source は marketplace.json からの相対パス（例: "./plugins/my-plugin"）
```

## ファイルの必須/オプション

| ファイル | 必須 | 説明 |
|---------|------|------|
| `.claude-plugin/plugin.json` | 必須 | プラグイン定義 |
| `commands/*.md` | オプション | スラッシュコマンド |
| `agents/*.md` | オプション | エージェント定義 |
| `skills/*/SKILL.md` | オプション | スキル定義 |
| `hooks/hooks.json` | オプション | フック設定 |
| `.mcp.json` | オプション | MCP設定 |
| `README.md` | 推奨 | プラグイン説明 |
