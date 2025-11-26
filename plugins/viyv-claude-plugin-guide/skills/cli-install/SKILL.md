---
name: cli-install
description: Provides guide for viyv-claude-plugin install command. Auto-invoke when user mentions: install plugin, viyv-claude-plugin install, install from GitHub, install from zip. Do NOT use for: setup, new, update, remove commands.
---
# install / remove / update-plugin コマンド

## install - プラグインのインストール

様々なソースからプラグインをインストールします。

```bash
npx viyv-claude-plugin install <source> [name...] [options]
```

### ソースタイプ

| タイプ | 例 |
|-------|-----|
| ローカルディレクトリ | `./path/to/plugin` |
| ZIPファイル | `./plugin.zip` |
| GitHub (HTTPS) | `https://github.com/user/repo` |
| GitHub (短縮形) | `github:user/repo` |
| Git URL | `git@github.com:user/repo.git` |
| HTTP URL | `https://example.com/plugin.zip` |

### オプション

| オプション | 説明 |
|-----------|------|
| `-p, --path <path>` | インストール先マーケットプレイスのパス |
| `-n, --name <name>` | マーケットプレイス名 |
| `--ref <ref>` | Gitブランチ/タグ/コミット |
| `--force` | 既存プラグインを上書き |
| `--dry-run` | 実行内容を表示のみ |

### 使用例

```bash
# ローカルディレクトリからインストール
npx viyv-claude-plugin install ./my-plugin

# GitHubからインストール
npx viyv-claude-plugin install github:user/repo

# 特定ブランチからインストール
npx viyv-claude-plugin install github:user/repo --ref develop

# マーケットプレイスから複数プラグインを選択インストール
npx viyv-claude-plugin install ./marketplace plugin1 plugin2
```

## remove - プラグインの削除

インストール済みプラグインを削除します。

```bash
npx viyv-claude-plugin remove <id> [options]
```

### 使用例

```bash
# プラグインを削除
npx viyv-claude-plugin remove my-plugin

# 削除前に確認
npx viyv-claude-plugin remove my-plugin --dry-run
```

## update-plugin - プラグインの更新

プラグインを元のソースから再インストールして更新します。

```bash
npx viyv-claude-plugin update-plugin <id> [options]
```

### オプション

| オプション | 説明 |
|-----------|------|
| `--source <source>` | 新しいソースを指定 |
| `--ref <ref>` | Gitブランチ/タグ/コミット |

### 使用例

```bash
# プラグインを更新
npx viyv-claude-plugin update-plugin my-plugin

# 別のブランチから更新
npx viyv-claude-plugin update-plugin my-plugin --ref main
```
