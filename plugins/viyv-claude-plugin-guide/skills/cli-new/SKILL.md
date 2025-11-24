---
name: cli-new
description: Provides guide for viyv-claude-plugin new command to scaffold plugins. Auto-invoke when user mentions: viyv-claude-plugin new, scaffold plugin, create new plugin project, initialize plugin. Do NOT use for: install, setup, update commands.
---
# new コマンド - プラグインプロジェクトの作成

新規プラグインプロジェクト（マーケットプレイス + プラグイン）を作成します。

```bash
npx @viyv-claude-plugin/cli new <name> [options]
```

## オプション

| オプション | 説明 | デフォルト |
|-----------|------|-----------|
| `--dir <path>` | 作成先ディレクトリ | カレントディレクトリ |
| `--description <text>` | プラグインの説明 | `"A new plugin"` |
| `--version <version>` | プラグインバージョン | `"0.0.1"` |
| `--author-name <name>` | 作者名 | - |
| `--author-email <email>` | 作者メール | - |
| `--marketplace-name <name>` | マーケットプレイス名 | `"Local Marketplace"` |
| `--owner-name <name>` | マーケットプレイスオーナー名 | - |
| `--owner-email <email>` | マーケットプレイスオーナーメール | - |
| `--force` | 既存ファイルを上書き | `false` |

## 使用例

```bash
# 基本的な使い方
npx @viyv-claude-plugin/cli new my-plugin

# 詳細情報を指定
npx @viyv-claude-plugin/cli new my-plugin \
  --description "My awesome plugin" \
  --version "1.0.0" \
  --author-name "Your Name" \
  --author-email "you@example.com"

# 別のディレクトリに作成
npx @viyv-claude-plugin/cli new my-plugin --dir ./projects
```

## 生成されるファイル構造

```
<current-dir>/
├── .claude-plugin/
│   └── marketplace.json       # マーケットプレイス定義
└── plugins/
    └── <plugin-name>/
        ├── .claude-plugin/
        │   └── plugin.json    # プラグインメタデータ
        ├── commands/
        │   └── sample-command.md
        ├── agents/
        │   └── sample-agent.md
        ├── skills/
        │   └── sample-skill/
        │       └── SKILL.md
        ├── hooks/
        │   └── hooks.json
        ├── .mcp.json
        └── README.md
```

## 作成後の次のステップ

1. `plugins/<name>/` 内のファイルを編集
2. 不要なサンプルファイルを削除
3. スキル・コマンド・エージェントを追加
4. `setup` コマンドでClaude Codeに登録

```bash
# Claude Codeに登録
npx @viyv-claude-plugin/cli setup
```
