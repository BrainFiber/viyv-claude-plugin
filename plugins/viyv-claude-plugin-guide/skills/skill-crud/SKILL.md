---
name: skill-create-edit-delete
description: Provides file placement rules, validation requirements, and SKILL.md structure. Auto-invoke when user mentions: skill, SKILL.md, add skill, create skill, edit skill, delete skill, modify skill, skill file, skill directory. Do NOT use for: commands, agents, hooks, MCP, plugin.json.
---
# SKILL.md の作成方法

スキルはClaude Codeが文脈に応じて自動的に呼び出す知識ベースです。

## ファイル配置

スキルは**プラグインルートディレクトリ**内の `skills/` フォルダに配置します。

```
plugins/<plugin-name>/           # プラグインルートディレクトリ
├── .claude-plugin/
│   └── plugin.json
└── skills/                      # プラグインルートからの相対パス
    └── <skill-id>/
        ├── SKILL.md             # [必須] スキル定義
        └── additional-file.md   # [オプション] 追加ファイル
```

### 具体例

`get-weather` プラグインに `weather-forecast` スキルを追加する場合：

```
plugins/get-weather/skills/weather-forecast/SKILL.md
```

**重要**: `skills/` はプロジェクトルートではなく、対象プラグインのルートディレクトリ内に作成してください。

## 作成前の確認事項

スキルを作成する前に、必ず以下を確認してください：

### 1. 対象プラグインを特定する

現在のディレクトリ構造を確認し、**どのプラグインにスキルを追加するか**を明確にします。

**マーケットプレイス環境の場合**（`.claude-plugin/marketplace.json` がある）：
```
<marketplace>/
├── .claude-plugin/
│   └── marketplace.json       ← これがあればマーケットプレイス
└── plugins/
    ├── plugin-a/              ← スキルはここに追加
    └── plugin-b/              ← またはここに追加
```

この場合、`<marketplace>/skills/` ではなく、`<marketplace>/plugins/<plugin-name>/skills/` に作成してください。

**単独プラグイン環境の場合**（`.claude-plugin/plugin.json` がある）：
```
<plugin>/
├── .claude-plugin/
│   └── plugin.json            ← これがあれば単独プラグイン
└── skills/                    ← ここに作成
```

### 2. マーケットプレイスのルートには作成しない

```
❌ <marketplace>/skills/weather-forecast/SKILL.md
✅ <marketplace>/plugins/get-weather/skills/weather-forecast/SKILL.md
```

マーケットプレイスのルートディレクトリにはプラグインコンポーネントを配置できません。必ず `plugins/` 配下のプラグイン内に作成してください。

## 自動ロードについて

`skills/` ディレクトリは Claude Code により**自動的に検出してロード**されます。そのため:

- `plugin.json` で `skills` フィールドを指定する**必要はありません**
- `skills/` 内のサブディレクトリにある `SKILL.md` は自動的にスキルとして登録されます

`plugin.json` の `skills` フィールドは、デフォルトの `skills/` ディレクトリ**以外**の場所にあるスキルを追加で読み込みたい場合にのみ使用します。

## SKILL.md の構造

```markdown
---
name: skill-name
description: スキルの説明。どのような質問・状況でトリガーされるか記述
---
# スキルタイトル

スキルの本文（使い方、コード例、注意事項など）
```

## フロントマター（必須）

| フィールド | 説明 | 制限 |
|-----------|------|------|
| `name` | スキル名 | 最大64文字、XMLタグ禁止 |
| `description` | 説明（トリガー条件を含める） | 最大1024文字、XMLタグ禁止 |

## バリデーションルール

### スキルID（ディレクトリ名）
- 小文字、数字、ハイフンのみ: `^[a-z0-9-]{1,64}$`
- 最大64文字
- 予約語禁止: `anthropic`, `claude` を含めない

### 本文
- 最大500行

### 追加ファイル
- 相対パスのみ
- 最大1サブディレクトリ深度

## description の書き方（重要）

**description はスキルが呼ばれるかどうかを決める最重要フィールドです。**

Claude は `name` と `description` だけを見てスキルを選択します。description が曖昧だとスキルは呼ばれません。

### ベストプラクティス

#### 1. 三人称・説明調で書く

```markdown
# ✅ 良い例
description: Provides guidelines for REST API design and endpoint creation.

# ❌ 悪い例
description: I can help you with API design.
description: Use this to create APIs.
```

#### 2. 「何をするか」+「いつ使うか」を両方書く

```markdown
# ✅ 良い例
description: Provides REST API design patterns and best practices. Auto-invoke when user mentions: API, REST, endpoint, HTTP method, request, response.

# ❌ 悪い例
description: API guide.
description: Helps with APIs.
```

#### 3. Auto-invoke when パターンを使う

トリガーとなるキーワードを明示的に列挙します：

```markdown
description: Provides Git workflow guidelines. Auto-invoke when user mentions: git, branch, commit, merge, rebase, pull request, PR, git flow.
```

#### 4. Do NOT use for パターンを使う

似た機能がある場合、使わない状況を明記して誤発火を防ぎます：

```markdown
description: Provides API design guidelines. Auto-invoke when user mentions: API, REST, endpoint. Do NOT use for: database schema, frontend components, authentication.
```

### 推奨テンプレート

```markdown
description: [何を提供するか]. Auto-invoke when user mentions: [キーワード1], [キーワード2], [キーワード3]. Do NOT use for: [除外項目1], [除外項目2].
```

### 悪い description の例

```markdown
# ❌ 曖昧すぎる
description: Helps with documents.
description: Useful tool.
description: Development guide.

# ❌ トリガーキーワードがない
description: This skill provides information about our coding standards.

# ❌ 空または短すぎる
description: ""
description: API
```

## バリデーションエラーの例

```markdown
# NG: nameにXMLタグ
name: <my-skill>

# NG: スキルIDに大文字
plugins/my-plugin/skills/MySkill/SKILL.md

# NG: スキルIDにclaude含む
plugins/my-plugin/skills/claude-helper/SKILL.md

# NG: descriptionが空
description: ""

# NG: プラグインルート外に作成
skills/weather-forecast/SKILL.md  # プラグインルートを指定していない
```

## 完全な例

ファイルパス: `plugins/my-api-plugin/skills/api-guide/SKILL.md`

```markdown
---
name: api-design-guide
description: Provides REST API design patterns, endpoint naming conventions, and HTTP method usage. Auto-invoke when user mentions: API, REST, endpoint, HTTP, GET, POST, PUT, DELETE, request, response, JSON. Do NOT use for: database, frontend, authentication.
---
# REST API 設計ガイド

## エンドポイント命名規則

- リソース名は複数形: `/users`, `/posts`
- ネストは2階層まで: `/users/{id}/posts`

## HTTPメソッド

| メソッド | 用途 |
|---------|------|
| GET | 取得 |
| POST | 作成 |
| PUT | 更新（全体） |
| PATCH | 更新（部分） |
| DELETE | 削除 |

## レスポンス形式

\`\`\`json
{
  "data": {},
  "meta": {
    "total": 100,
    "page": 1
  }
}
\`\`\`
```
