---
name: hooks-create-edit-delete
description: Provides configuration guide for hooks.json event handlers. Auto-invoke when user mentions: hook, hooks.json, add hook, create hook, edit hook, delete hook, event handler, SessionStart, PostToolUse. Do NOT use for: skills, commands, agents, MCP, plugin.json.
---
# hooks.json の作成方法

フックはClaude Codeの特定イベントでシェルコマンドを実行する仕組みです。

## ファイル配置

フック設定は**プラグインルートディレクトリ**内の `hooks/` フォルダに配置します。

```
plugins/<plugin-name>/           # プラグインルートディレクトリ
├── .claude-plugin/
│   └── plugin.json
└── hooks/                       # プラグインルートからの相対パス
    └── hooks.json
```

### 具体例

`my-tools` プラグインにフックを追加する場合：

```
plugins/my-tools/hooks/hooks.json
```

**重要**: `hooks/` はプロジェクトルートではなく、対象プラグインのルートディレクトリ内に作成してください。

## 自動ロードについて

Claude Code は `hooks/hooks.json` を**自動的に検出してロード**します。そのため:

- `plugin.json` で `hooks` フィールドを指定する**必要はありません**
- `"hooks": "./hooks/hooks.json"` と指定すると「重複フックファイル」エラーになります

```
❌ 間違い: plugin.json で hooks/hooks.json を指定
{
  "name": "My Plugin",
  "hooks": "./hooks/hooks.json"  // これは不要！エラーになる
}

✅ 正しい: hooks フィールドは指定しない
{
  "name": "My Plugin"
}
```

`plugin.json` の `hooks` フィールドは、**追加の**フックファイル（標準の `hooks/hooks.json` 以外）を読み込みたい場合や、インライン設定を使用する場合にのみ使用します。

## hooks.json の基本構造

```json
{
  "hooks": {
    "イベント名": [
      {
        "matcher": "ツール名パターン",
        "hooks": [
          {
            "type": "command",
            "command": "実行するコマンド"
          }
        ]
      }
    ]
  }
}
```

### 構造の説明

1. **トップレベル**: `"hooks"` オブジェクト
2. **イベントタイプ**: キーとしてイベント名を使用（例: `"PostToolUse"`）
3. **マッチャー配列**: 各イベントに対するマッチャーオブジェクトの配列
4. **マッチャーオブジェクト**: `matcher`（ツール名パターン）と `hooks`（実行するフック配列）
5. **フックオブジェクト**: `type` と `command` を含む

## イベントタイプ一覧

| イベント | 説明 | タイミング |
|---------|------|-----------|
| `PreToolUse` | ツール実行前 | 各ツール呼び出し前 |
| `PostToolUse` | ツール実行後 | 各ツール呼び出し後 |
| `PermissionRequest` | 許可ダイアログ表示時 | 許可が必要な操作時 |
| `UserPromptSubmit` | プロンプト送信時 | ユーザーがプロンプトを送信した時 |
| `Notification` | 通知発生時 | 通知イベント発生時 |
| `Stop` | 停止時 | Claudeが停止を試みた時 |
| `SubagentStop` | サブエージェント停止時 | サブエージェントが停止を試みた時 |
| `SessionStart` | セッション開始時 | Claude Code起動時 |
| `SessionEnd` | セッション終了時 | Claude Code終了時 |
| `PreCompact` | コンパクト前 | 会話履歴がコンパクト化される前 |

## フックタイプ

| タイプ | 説明 |
|-------|------|
| `command` | シェルコマンドまたはスクリプトを実行 |
| `validation` | ファイル内容やプロジェクト状態を検証 |
| `notification` | アラートやステータス更新を送信 |

## matcher パターン

`matcher` はツール名を正規表現パターンで指定します：

| パターン | 説明 |
|---------|------|
| `Write` | Write ツールにマッチ |
| `Edit` | Edit ツールにマッチ |
| `Bash` | Bash ツールにマッチ |
| `Write\|Edit` | Write または Edit にマッチ |
| `.*` | すべてのツールにマッチ |

## 環境変数

**`${CLAUDE_PLUGIN_ROOT}`**: プラグインディレクトリへの絶対パスを格納。フックやスクリプト内でこの変数を使用して正しいパスを指定できます。

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/format-code.sh"
          }
        ]
      }
    ]
  }
}
```

## 使用例

### ファイル変更後にフォーマッタを実行

ファイルパス: `plugins/my-tools/hooks/hooks.json`

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/format-code.sh"
          }
        ]
      }
    ]
  }
}
```

### セッション開始時の環境チェック

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": ".*",
        "hooks": [
          {
            "type": "command",
            "command": "node --version && npm --version"
          }
        ]
      }
    ]
  }
}
```

### 複数のイベントにフックを設定

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": ".*",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'Welcome to the project!'"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "npm run lint"
          }
        ]
      },
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "git status --short"
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'About to execute Bash command'"
          }
        ]
      }
    ]
  }
}
```

## plugin.json でのインライン設定

`hooks/hooks.json` の代わりに、`plugin.json` 内に直接設定を記述することもできます：

```json
{
  "name": "My Plugin",
  "hooks": {
    "hooks": {
      "PostToolUse": [
        {
          "matcher": "Write",
          "hooks": [
            {
              "type": "command",
              "command": "npm run format"
            }
          ]
        }
      ]
    }
  }
}
```

**注意**: `hooks/hooks.json` ファイルとインライン設定を両方使用すると重複エラーになる可能性があります。どちらか一方を使用してください。

## 注意事項

- コマンドは同期的に実行される
- エラーが発生してもClaude Codeは続行する
- セキュリティ上、信頼できるコマンドのみ設定
- 環境変数は現在のシェル環境を継承
- `${CLAUDE_PLUGIN_ROOT}` を使用してプラグイン内のスクリプトやファイルを参照

## トラブルシューティング

### 「Duplicate hooks file detected」エラー

`plugin.json` で `"hooks": "./hooks/hooks.json"` を指定している場合に発生します。
`hooks/hooks.json` は自動ロードされるため、`plugin.json` の `hooks` フィールドを削除してください。

### フックが実行されない

1. `hooks/hooks.json` の JSON 構文が正しいか確認
2. イベント名のスペルが正しいか確認（大文字小文字を区別）
3. `matcher` パターンが対象ツールに一致するか確認
4. スクリプトに実行権限があるか確認（`chmod +x script.sh`）
