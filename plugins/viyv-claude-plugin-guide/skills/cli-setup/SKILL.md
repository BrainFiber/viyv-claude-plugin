---
name: cli-setup
description: Provides guide for viyv-claude-plugin setup command to register marketplace. Auto-invoke when user mentions: viyv-claude-plugin setup, register marketplace, Claude Code registration. Do NOT use for: install, new, update commands.
---
# setup / uninstall / update コマンド

## setup - マーケットプレイスの登録

ローカルマーケットプレイスをClaude Codeに登録します。

```bash
npx viyv-claude-plugin setup [options]
```

### オプション

| オプション | 説明 |
|-----------|------|
| `-p, --path <path>` | マーケットプレイスのパス（デフォルト: カレントディレクトリ） |
| `-n, --name <name>` | マーケットプレイス名（省略時: ディレクトリ名） |
| `--dry-run` | 実行内容を表示のみ |

### 使用例

```bash
# カレントディレクトリのマーケットプレイスを登録
npx viyv-claude-plugin setup

# 特定のパスを指定
npx viyv-claude-plugin setup -p /path/to/marketplace

# カスタム名で登録
npx viyv-claude-plugin setup -n "My Plugins"
```

## uninstall - マーケットプレイスの削除

登録済みのマーケットプレイスをClaude Codeから削除します。

```bash
npx viyv-claude-plugin uninstall [options]
```

### 使用例

```bash
# カレントディレクトリのマーケットプレイスを削除
npx viyv-claude-plugin uninstall

# 名前を指定して削除
npx viyv-claude-plugin uninstall -n "My Plugins"
```

## update - マーケットプレイスの更新

ソースからマーケットプレイスを更新します。プラグインの追加・変更後に実行してください。

```bash
npx viyv-claude-plugin update [options]
```

### 使用例

```bash
# マーケットプレイスを更新
npx viyv-claude-plugin update

# 変更内容を確認（実行せず）
npx viyv-claude-plugin update --dry-run
```

## 登録後の確認

登録後、Claude Codeで以下を確認できます：
- `/plugins` コマンドでインストール済みプラグイン一覧
- `skill:` でスキルを呼び出し
- `/` + コマンド名でスラッシュコマンドを実行
