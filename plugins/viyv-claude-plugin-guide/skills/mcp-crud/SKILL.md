---
name: mcp-create-edit-delete
description: Provides configuration guide for .mcp.json MCP server settings. Auto-invoke when user mentions: MCP, .mcp.json, MCP server, add MCP, create MCP, edit MCP, delete MCP, Model Context Protocol. Do NOT use for: skills, commands, agents, hooks, plugin.json.
---
# .mcp.json の作成方法

MCP (Model Context Protocol) サーバーは外部ツールとの連携を可能にします。

## ファイル配置

`.mcp.json` は**プラグインルートディレクトリ**直下に配置します。

```
plugins/<plugin-name>/           # プラグインルートディレクトリ
├── .claude-plugin/
│   └── plugin.json
└── .mcp.json                    # プラグインルート直下
```

### 具体例

`api-tools` プラグインにMCP設定を追加する場合：

```
plugins/api-tools/.mcp.json
```

**重要**: `.mcp.json` はプロジェクトルートではなく、対象プラグインのルートディレクトリ直下に作成してください。

## 自動ロードについて

`.mcp.json` は Claude Code により**自動的に検出してロード**されます。そのため:

- `plugin.json` で `mcpServers` フィールドを指定する**必要はありません**
- プラグインルート直下の `.mcp.json` は自動的に読み込まれます

`plugin.json` の `mcpServers` フィールドは、デフォルトの `.mcp.json` **以外**のファイルを追加で読み込みたい場合や、インライン設定を使用する場合にのみ使用します。

## 環境変数 ${CLAUDE_PLUGIN_ROOT}

**`${CLAUDE_PLUGIN_ROOT}`** はプラグインディレクトリへの絶対パスを格納する環境変数です。プラグイン内のサーバーやスクリプトを参照する際に使用します：

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

この変数を使用することで、プラグインがどこにインストールされても正しいパスが解決されます。

## 基本構造

```json
{
  "mcpServers": {
    "server-name": {
      "command": "実行コマンド",
      "args": ["引数1", "引数2"],
      "env": {
        "ENV_VAR": "value"
      }
    }
  }
}
```

## フィールド説明

| フィールド | 型 | 必須 | 説明 |
|-----------|------|------|------|
| `command` | string | 必須 | 実行するコマンド |
| `args` | string[] | - | コマンド引数 |
| `env` | object | - | 環境変数 |
| `cwd` | string | - | 作業ディレクトリ |

## 使用例

### Node.js MCPサーバー

ファイルパス: `plugins/my-tools/.mcp.json`

```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["./mcp-server/index.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

### Python MCPサーバー

```json
{
  "mcpServers": {
    "python-server": {
      "command": "python",
      "args": ["-m", "my_mcp_server"],
      "env": {
        "PYTHONPATH": "./src"
      }
    }
  }
}
```

### npx経由のサーバー

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@anthropic/mcp-server-filesystem",
        "/path/to/allowed/directory"
      ]
    }
  }
}
```

### 複数サーバーの設定

```json
{
  "mcpServers": {
    "database": {
      "command": "node",
      "args": ["./servers/db-server.js"],
      "env": {
        "DATABASE_URL": "postgresql://localhost:5432/mydb"
      }
    },
    "api-client": {
      "command": "python",
      "args": ["./servers/api_client.py"],
      "env": {
        "API_KEY": "${API_KEY}"
      }
    }
  }
}
```

## 環境変数の参照

`${VAR_NAME}` 形式でシステム環境変数を参照可能:

```json
{
  "mcpServers": {
    "secure-server": {
      "command": "node",
      "args": ["./server.js"],
      "env": {
        "SECRET_KEY": "${MY_SECRET_KEY}",
        "API_TOKEN": "${API_TOKEN}"
      }
    }
  }
}
```

## MCPサーバーの開発

MCPサーバーを自作する場合、以下のSDKを使用:

- **TypeScript/JavaScript**: `@modelcontextprotocol/sdk`
- **Python**: `mcp`

```bash
npm install @modelcontextprotocol/sdk
# or
pip install mcp
```

## 注意事項

- サーバーは Claude Code 起動時に自動的に開始
- command は絶対パスまたは PATH 内のコマンド
- セキュリティ上、信頼できるサーバーのみ設定
- エラー時は Claude Code のログで確認可能
