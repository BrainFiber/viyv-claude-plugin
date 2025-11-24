---
name: command-create-edit-delete
description: Provides file placement rules and structure for slash command markdown files. Auto-invoke when user mentions: command, slash command, /command, add command, create command, edit command, delete command, command file. Do NOT use for: skills, agents, hooks, MCP, plugin.json.
---
# スラッシュコマンドの作成方法

スラッシュコマンドはClaude Codeで `/コマンド名` で呼び出せるカスタムコマンドです。

## ファイル配置

コマンドファイルは**プラグインルートディレクトリ**内の `commands/` フォルダに配置します。

```
plugins/<plugin-name>/           # プラグインルートディレクトリ
├── .claude-plugin/
│   └── plugin.json
└── commands/                    # プラグインルートからの相対パス
    ├── my-command.md
    ├── another-command.md
    └── subdir/
        └── nested-command.md
```

### 具体例

`my-tools` プラグインに `review` コマンドを追加する場合：

```
plugins/my-tools/commands/review.md
```

**重要**: `commands/` はプロジェクトルートではなく、対象プラグインのルートディレクトリ内に作成してください。

## 作成前の確認事項

コマンドを作成する前に、必ず以下を確認してください：

### 対象プラグインを特定する

**マーケットプレイス環境の場合**（`.claude-plugin/marketplace.json` がある）：
- `plugins/` 配下のどのプラグインに追加するか確認
- マーケットプレイスのルートには作成しない

```
❌ <marketplace>/commands/my-command.md
✅ <marketplace>/plugins/<plugin-name>/commands/my-command.md
```

**単独プラグイン環境の場合**（`.claude-plugin/plugin.json` がある）：
- そのディレクトリの `commands/` に作成

## 自動ロードについて

`commands/` ディレクトリは Claude Code により**自動的に検出してロード**されます。そのため:

- `plugin.json` で `commands` フィールドを指定する**必要はありません**
- `commands/` 内の `.md` ファイルは自動的にスラッシュコマンドとして登録されます

`plugin.json` の `commands` フィールドは、デフォルトの `commands/` ディレクトリ**以外**の場所にあるコマンドファイルを追加で読み込みたい場合にのみ使用します。

## コマンドファイルの構造

```markdown
---
name: command-name
description: コマンドの説明
---
# コマンドタイトル

コマンドが実行された時にClaude Codeに渡される指示内容
```

## フロントマター

| フィールド | 必須 | 説明 |
|-----------|------|------|
| `name` | 推奨 | コマンド名（省略時: ファイル名） |
| `description` | 推奨 | コマンドの説明（ヘルプに表示） |

## コマンド名のルール

- 小文字、数字、ハイフン推奨
- ファイル名から `.md` を除いた部分がコマンド名になる
- 例: `git-commit.md` → `/git-commit`

## 引数の受け取り

コマンド本文で `$ARGUMENTS` を使用すると、ユーザーが入力した引数を受け取れます。

```markdown
---
name: search
description: コードベースを検索
---
# Search Command

以下のキーワードでコードベースを検索してください:

$ARGUMENTS
```

使用例: `/search authentication logic`

## 完全な例

ファイルパス: `plugins/dev-tools/commands/review.md`

```markdown
---
name: review
description: コードレビューを実行
---
# Code Review

現在のファイルまたは選択されたコードをレビューしてください。
以下の観点でチェック:

1. バグや潜在的な問題
2. パフォーマンス改善の余地
3. 可読性とベストプラクティス
```

### 引数付きコマンド

ファイルパス: `plugins/dev-tools/commands/test.md`

```markdown
---
name: test
description: 指定したファイルのテストを作成
---
# Create Tests

以下のファイル/機能に対するテストを作成してください:

$ARGUMENTS

- ユニットテストを優先
- エッジケースを網羅
- モックは最小限に
```

## 呼び出し方

Claude Codeで:

```
/review
/test src/utils/helper.ts
/search error handling
```
