# viyv-claude-plugin Guide

viyv-claude-plugin の使い方ガイドスキル集です。

Claude Code でこのプラグインをインストールすると、CLI コマンドやプラグイン構造について質問した時に、適切なスキルが自動的に呼び出されます。

## 提供するスキル

### CLI コマンドガイド

| スキル | 説明 |
|-------|------|
| `cli-overview` | CLI 全コマンド一覧と使い方概要 |
| `cli-setup` | setup/uninstall/update コマンドの使い方 |
| `cli-install` | install/remove/update-plugin コマンドの使い方 |
| `cli-new` | new コマンドでプラグイン作成 |

### プラグイン作成ガイド

| スキル | 説明 |
|-------|------|
| `plugin-structure` | プラグインディレクトリ構造の解説 |
| `create-plugin-json` | plugin.json の書き方 |
| `create-skill` | SKILL.md の作成方法とバリデーション |
| `create-command` | スラッシュコマンドの作成方法 |
| `create-agent` | エージェントの作成方法 |
| `create-hooks` | hooks.json の設定方法 |
| `create-mcp` | .mcp.json (MCP サーバー) の設定方法 |

### API ガイド

| スキル | 説明 |
|-------|------|
| `core-api` | Core API プログラミングガイド |

## インストール方法

```bash
# このリポジトリのルートで
npx viyv-claude-plugin setup
```

## 使い方

Claude Code で以下のような質問をすると、関連するスキルが自動的に呼び出されます：

- "viyv-claude-plugin の CLI コマンドを教えて"
- "新しいプラグインを作成したい"
- "SKILL.md の書き方は？"
- "hooks.json の設定方法は？"
- "Core API の使い方を教えて"
