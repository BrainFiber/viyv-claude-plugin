---
name: agent-create-edit-delete
description: Provides file placement rules and structure for agent definition files. Auto-invoke when user mentions: agent, agent file, add agent, create agent, edit agent, delete agent, agent definition, subagent. Do NOT use for: skills, commands, hooks, MCP, plugin.json.
---
# エージェントの作成方法

エージェントは特定タスクに特化したAIアシスタントの定義です。

## ファイル配置

エージェントファイルは**プラグインルートディレクトリ**内の `agents/` フォルダに配置します。

```
plugins/<plugin-name>/           # プラグインルートディレクトリ
├── .claude-plugin/
│   └── plugin.json
└── agents/                      # プラグインルートからの相対パス
    ├── code-reviewer.md
    ├── test-writer.md
    └── documentation-helper.md
```

### 具体例

`dev-tools` プラグインに `code-reviewer` エージェントを追加する場合：

```
plugins/dev-tools/agents/code-reviewer.md
```

**重要**: `agents/` はプロジェクトルートではなく、対象プラグインのルートディレクトリ内に作成してください。

## 作成前の確認事項

エージェントを作成する前に、必ず以下を確認してください：

### 対象プラグインを特定する

**マーケットプレイス環境の場合**（`.claude-plugin/marketplace.json` がある）：
- `plugins/` 配下のどのプラグインに追加するか確認
- マーケットプレイスのルートには作成しない

```
❌ <marketplace>/agents/my-agent.md
✅ <marketplace>/plugins/<plugin-name>/agents/my-agent.md
```

**単独プラグイン環境の場合**（`.claude-plugin/plugin.json` がある）：
- そのディレクトリの `agents/` に作成

## 自動ロードについて

`agents/` ディレクトリは Claude Code により**自動的に検出してロード**されます。そのため:

- `plugin.json` で `agents` フィールドを指定する**必要はありません**
- `agents/` 内の `.md` ファイルは自動的にエージェントとして登録されます

`plugin.json` の `agents` フィールドは、デフォルトの `agents/` ディレクトリ**以外**の場所にあるエージェントファイルを追加で読み込みたい場合にのみ使用します。

## エージェントファイルの構造

```markdown
---
name: agent-name
description: エージェントの説明
---
# エージェント名

## 役割

このエージェントの役割と専門分野

## Capabilities（能力）

- 能力1
- 能力2

## 指示

エージェントへの具体的な指示内容
```

## フロントマター

| フィールド | 必須 | 説明 |
|-----------|------|------|
| `name` | 推奨 | エージェント名 |
| `description` | 推奨 | エージェントの説明 |

## 完全な例

### コードレビューエージェント

ファイルパス: `plugins/dev-tools/agents/code-reviewer.md`

```markdown
---
name: code-reviewer
description: コードの品質とセキュリティをレビューするエージェント
---
# Code Reviewer Agent

## 役割

コードの品質、セキュリティ、保守性を専門的にレビューします。

## Capabilities

- コードの静的解析
- セキュリティ脆弱性の検出
- パフォーマンス問題の指摘
- ベストプラクティスの提案

## レビュー観点

1. **セキュリティ**
   - インジェクション脆弱性
   - 認証・認可の問題
   - 機密情報の露出

2. **パフォーマンス**
   - N+1クエリ
   - 不要な再レンダリング
   - メモリリーク

3. **保守性**
   - コードの重複
   - 命名の一貫性
   - 適切な抽象化

## 出力形式

問題を発見した場合は以下の形式で報告:

- **ファイル**: ファイルパス
- **行**: 行番号
- **重要度**: Critical/Warning/Info
- **説明**: 問題の説明
- **推奨**: 修正案
```

### テスト作成エージェント

ファイルパス: `plugins/dev-tools/agents/test-writer.md`

```markdown
---
name: test-writer
description: テストコードを作成するエージェント
---
# Test Writer Agent

## 役割

与えられたコードに対して包括的なテストを作成します。

## Capabilities

- ユニットテスト作成
- 統合テスト作成
- モックの設計
- テストデータ生成

## テスト作成方針

1. AAA パターン（Arrange, Act, Assert）
2. 1テスト1アサーション（原則）
3. テスト名は振る舞いを説明
4. エッジケースを網羅
```

## エージェントの使い方

Claude Codeでエージェントは Task tool の subagent として利用可能です。
plugin.json の agents パスに配置されたエージェントが読み込まれます。
