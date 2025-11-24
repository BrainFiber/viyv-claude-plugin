---
name: plugin-json-create-edit-delete
description: Provides configuration guide for plugin.json metadata. Auto-invoke when user mentions: plugin.json, plugin metadata, plugin config, create plugin, edit plugin, plugin settings, .claude-plugin. Do NOT use for: skills, commands, agents, hooks, MCP.
---
# plugin.json の作成方法

`.claude-plugin/plugin.json` はプラグインのメタデータを定義する必須ファイルです。

## ファイル配置

`plugin.json` は**プラグインルートディレクトリ**内の `.claude-plugin/` フォルダに配置します。

```
plugins/<plugin-name>/           # プラグインルートディレクトリ
└── .claude-plugin/
    └── plugin.json              # 必須ファイル
```

### 具体例

`my-tools` プラグインの場合：

```
plugins/my-tools/.claude-plugin/plugin.json
```

**重要**: `.claude-plugin/` はプロジェクトルートではなく、対象プラグインのルートディレクトリ内に作成してください。

## 基本構造

```json
{
  "name": "my-plugin",
  "description": "プラグインの説明",
  "version": "1.0.0",
  "author": {
    "name": "Author Name",
    "email": "author@example.com"
  }
}
```

## 全フィールド一覧

### 必須フィールド

| フィールド | 型 | 説明 | 例 |
|-----------|------|------|------|
| `name` | string | プラグイン識別子（kebab-case、スペースなし） | `"deployment-tools"` |

### メタデータフィールド

| フィールド | 型 | 説明 | 例 |
|-----------|------|------|------|
| `version` | string | セマンティックバージョン | `"2.1.0"` |
| `description` | string | プラグインの説明 | `"Deployment automation"` |
| `author` | object | 作者情報 | `{"name": "Dev", "email": "..."}` |
| `author.name` | string | 作者名 | `"Dev Team"` |
| `author.email` | string | 作者メール | `"dev@company.com"` |
| `author.url` | string | 作者URL | `"https://example.com"` |
| `homepage` | string | ドキュメントURL | `"https://docs.example.com"` |
| `repository` | string | リポジトリURL | `"https://github.com/user/plugin"` |
| `license` | string | ライセンス識別子 | `"MIT"`, `"Apache-2.0"` |
| `keywords` | string[] | 検索用キーワード | `["deployment", "ci-cd"]` |

### コンポーネントパスフィールド

| フィールド | 型 | 説明 | 例 |
|-----------|------|------|------|
| `commands` | string\|array | 追加コマンドファイル/ディレクトリ | `"./custom/cmd.md"` |
| `agents` | string\|array | 追加エージェントファイル | `"./custom-agents/"` |
| `skills` | string | スキルディレクトリパス | `"./skills"` |
| `hooks` | string\|object | 追加フック設定パスまたはインライン設定 | `"./config/hooks.json"` |
| `mcpServers` | string\|object | MCP設定パスまたはインライン設定 | `"./mcp.json"` |

## デフォルトディレクトリの自動ロード

**重要**: Claude Code は以下のデフォルトディレクトリを**自動的に検出してロード**します：

| コンポーネント | デフォルト位置 | 説明 |
|--------------|--------------|------|
| コマンド | `commands/` | スラッシュコマンドの.mdファイル |
| エージェント | `agents/` | エージェント定義の.mdファイル |
| スキル | `skills/` | SKILL.mdを含むサブディレクトリ |
| フック | `hooks/hooks.json` | フック設定ファイル |
| MCPサーバー | `.mcp.json` | MCPサーバー定義 |

**したがって**: デフォルト位置にファイルを配置する場合、`plugin.json` で明示的に指定する必要はありません。

## パス指定のルール

### カスタムパスは「補足」であり「置換」ではない

`plugin.json` でカスタムパスを指定した場合、それは**デフォルトディレクトリに追加される**ものであり、**置換するものではありません**。

```json
{
  "name": "my-plugin",
  "commands": ["./extra-commands/deploy.md"]
}
```

この場合：
- `commands/` ディレクトリのコマンドも読み込まれる（自動ロード）
- `extra-commands/deploy.md` も追加で読み込まれる

### パスの基準

- すべてのパスは `plugin.json` からの**相対パス**で指定
- `plugin.json` は `.claude-plugin/` 内にあるため、`./commands` は `<plugin-root>/commands` を指す
- パスは `./` で始める必要がある

### 例: 追加パスの指定

```json
{
  "name": "my-plugin",
  "commands": [
    "./specialized/deploy.md",
    "./utilities/batch-process.md"
  ],
  "agents": [
    "./custom-agents/reviewer.md",
    "./custom-agents/tester.md"
  ]
}
```

## hooks フィールドについて

`hooks/hooks.json` は**自動的にロード**されます。そのため：

```json
// ❌ 間違い - 重複エラーになる
{
  "hooks": "./hooks/hooks.json"
}

// ✅ 正しい - デフォルトを使う場合は指定しない
{
  "name": "My Plugin"
}

// ✅ 正しい - 追加フックファイルを指定する場合
{
  "hooks": "./config/extra-hooks.json"
}

// ✅ 正しい - インライン設定を使う場合
{
  "hooks": {
    "hooks": {
      "PostToolUse": [...]
    }
  }
}
```

詳細は `create-hooks` スキルを参照してください。

## 環境変数

**`${CLAUDE_PLUGIN_ROOT}`**: プラグインディレクトリへの絶対パスを格納します。フック設定やMCP設定内でこの変数を使用できます。

```json
{
  "mcpServers": {
    "my-server": {
      "command": "${CLAUDE_PLUGIN_ROOT}/servers/my-server",
      "args": ["--config", "${CLAUDE_PLUGIN_ROOT}/config.json"],
      "env": {
        "DATA_PATH": "${CLAUDE_PLUGIN_ROOT}/data"
      }
    }
  }
}
```

## 完全な例

ファイルパス: `plugins/dev-tools/.claude-plugin/plugin.json`

```json
{
  "name": "dev-tools",
  "description": "開発を支援するツール集",
  "version": "1.0.0",
  "author": {
    "name": "Your Name",
    "email": "you@example.com",
    "url": "https://example.com"
  },
  "homepage": "https://github.com/user/plugin",
  "repository": "https://github.com/user/plugin",
  "license": "MIT",
  "keywords": ["development", "tools", "productivity"]
}
```

この例では、デフォルトディレクトリ（`commands/`, `agents/`, `skills/`, `hooks/hooks.json`, `.mcp.json`）が自動的にロードされるため、明示的なパス指定は不要です。

## 最小限の例

デフォルトを使用する場合、必要なのは `name` のみです：

```json
{
  "name": "my-plugin"
}
```

## バリデーションルール

- `name`: 必須、kebab-case（例: `my-plugin`）、空文字不可
- `version`: セマンティックバージョン形式推奨（例: `1.0.0`）
- パス: 存在するディレクトリ/ファイルを指定、`./` で始める

## よくある間違い

### デフォルトを指定してしまう

```json
// ❌ 不要な指定（自動ロードされる）
{
  "name": "my-plugin",
  "commands": "./commands",
  "agents": "./agents",
  "skills": "./skills",
  "hooks": "./hooks/hooks.json",
  "mcpServers": "./.mcp.json"
}

// ✅ シンプルでOK
{
  "name": "my-plugin"
}
```

### hooks/hooks.json を明示的に指定

```json
// ❌ 重複エラーになる
{
  "hooks": "./hooks/hooks.json"
}
```
