# viyv-claude-plugin

Claude Code 用プラグインを作成・管理するための CLI ツールです。

## クイックスタート

```bash
# 新規プラグインプロジェクトを作成
npx viyv-claude-plugin new my-plugin

# Claude Code にマーケットプレイスを登録
npx viyv-claude-plugin setup

# プラグインを編集後、更新を反映
npx viyv-claude-plugin update
```

## コマンド一覧

### プロジェクト作成

```bash
npx viyv-claude-plugin new <name> [options]
```

| オプション | 説明 |
|-----------|------|
| `--dir <path>` | 作成先ディレクトリ |
| `--description <text>` | プラグインの説明 |
| `--force` | 既存ファイルを上書き |

### マーケットプレイス管理

```bash
# Claude Code に登録
npx viyv-claude-plugin setup [-p <path>] [-n <name>]

# 登録を削除
npx viyv-claude-plugin uninstall [-n <name>]

# 変更を反映
npx viyv-claude-plugin update [path]
```

### プラグイン管理

```bash
# 一覧表示
npx viyv-claude-plugin list

# インストール
npx viyv-claude-plugin install <source> [name...]
npx viyv-claude-plugin install ./marketplace --all

# 削除
npx viyv-claude-plugin remove <id>
```

## チーム展開

```bash
# 開発者: 変更をコミット & プッシュ
git add .claude-plugin plugins
git commit -m "Add Claude Code plugins"
git push

# チームメンバー: pull 後に install するだけ
git pull
npx viyv-claude-plugin install .
```

## 関連パッケージ

- [viyv-claude-plugin-core](https://www.npmjs.com/package/viyv-claude-plugin-core) - コアライブラリ

## ライセンス

MIT
