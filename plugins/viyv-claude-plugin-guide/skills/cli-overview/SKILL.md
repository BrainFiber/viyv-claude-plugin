---
name: cli-overview
description: Provides overview of all viyv-claude-plugin CLI commands. Auto-invoke when user mentions: viyv-claude-plugin CLI, CLI help, CLI commands, what commands are available. Do NOT use for: specific command details (use cli-install, cli-new, cli-setup instead).
---
# viyv-claude-plugin CLI 概要

viyv-claude-plugin CLIは、Claude Code用プラグインを管理するためのコマンドラインツールです。

## コマンド一覧

| コマンド | 説明 |
|---------|------|
| `new <name>` | 新規プラグインプロジェクトを作成 |
| `setup` | ローカルマーケットプレイスをClaude Codeに登録 |
| `uninstall` | 登録済みマーケットプレイスを削除 |
| `update` | マーケットプレイスをソースから更新 |
| `list` | インストール済みプラグイン一覧を表示 |
| `install <source> [name...]` | プラグインをインストール |
| `remove <id>` | プラグインを削除 |
| `update-plugin <id>` | プラグインを更新 |
| `help` | ヘルプを表示 |

## 基本的な使い方フロー

```bash
# 1. 新規プラグインプロジェクトを作成
npx @viyv-claude-plugin/cli new my-plugin

# 2. Claude Codeにマーケットプレイスを登録
npx @viyv-claude-plugin/cli setup

# 3. プラグインを編集・開発

# 4. 変更を反映
npx @viyv-claude-plugin/cli update
```

## 共通オプション

- `-p, --path <path>`: マーケットプレイスのパス（デフォルト: カレントディレクトリ）
- `-n, --name <name>`: マーケットプレイス名（省略時: ディレクトリ名）
- `--dry-run`: 実行内容を表示のみ（実際には変更しない）
- `-h, --help`: ヘルプを表示

## インストール方法

```bash
# グローバルインストール
npm install -g @viyv-claude-plugin/cli

# または npx で直接実行
npx @viyv-claude-plugin/cli <command>
```
