# viyv-claude-plugin ポータルサイト制作ブリーフ（Claude Agent SDK 特化・改訂版）
作成者: **brainfiber inc.**

本ブリーフは「Claude Agent SDK でローカル/プラグイン資産を扱う開発者」のための公式ポータルを構築する指示書です。初見の制作担当でも迷わず作れるよう、背景・目的・情報構成・ページ毎の具体コンテンツ・デザイン/アニメーション・図版指示まで詳細に記載しています。

---

## 1. 背景・目的・ゴール
- **背景**: Agent SDK でプラグイン/Skills/Agents/Hooks/MCP を扱うとき、ファイル構造と設定が複雑で初学者が迷いがち。既存 README では「どこに何を置き、SDK でどう読み込まれるか」が直感的にわかりにくい。
- **目的**:
  1) SDK 開発者が **5 分でセットアップ＆ Hello Plugin** を完了できる。
  2) プラグイン構造（commands/agents/skills/hooks/MCP）と SDK での動きが図とコードで即理解できる。
  3) チーム/CI 運用と高カバレッジ（信頼性）を提示し、安心して導入できる。
- **ゴール**:
  - Home → Getting Started → Examples → API Reference まで 3 クリック以内。
  - コード例はすべてコピペ可、実行前提を明記。
  - 図・アニメーションで「ID → パス → SDK」の流れが一目で分かる。

---

## 2. 情報構造（SDK 利用に直結するサイトマップ）
```
/
├── About
├── Getting Started
│   ├── Quickstart (5分)
│   └── Environment & Config
├── Features
│   ├── Plugin Lifecycle (Create/Update/Delete/Import)
│   ├── Components (Commands / Agents / Skills / Hooks / MCP)
│   └── Agent SDK Integration
├── Guides
│   ├── Full Workflow (path/URL import, adapter)
│   ├── Team/CI Usage
│   └── Troubleshooting
├── API Reference
│   ├── Managers & Adapters
│   └── Types & Schemas
├── Examples (basic-usage / full-coverage)
├── Downloads & Versioning
├── FAQ
└── Contact / Support
```

### 2.1 About
- 目的: 「Agent SDK 向けローカルプラグイン管理ライブラリ」であることを30秒で理解させる。
- コンテンツ:
  - 一文: 「Claude Agent SDK でプラグイン/Skills/Agents/Hooks/MCP を ID ベースで即使えるようにする Node.js ライブラリ」
  - 強み3点:  
    1) `.claude-plugin/plugin.json` 完全対応（commands/agents/skills/hooks/MCP）  
    2) Agent SDK 連携用 adapter 同梱（ID→パス解決）  
    3) 高カバレッジで信頼性担保 (Lines 99%+)
  - 対象: Agent SDK 開発者 / Claude Code ユーザー / チーム DevOps
  - 画像指示: ヒーロー図。左「Local plugins/marketplaces」→中央「viyv-claude-plugin (manager+adapter)」→右「Claude Agent SDK」。ダークグラデ背景＋細い配線パターン。

### 2.2 Getting Started
- Quickstart (5分):
  - コマンド: `pnpm install`, `pnpm --filter @viyv-claude-plugin build`
  - 20行以内のサンプル（create → list → delete）。前提: Node18+ & pnpm。
  - チェックリスト UI（create/list/delete 成功に緑チェック）。
- Environment & Config:
  - パス優先順位の図: `CLAUDE_PLUGIN_ROOT` > `~/.viyv-claude/config.json:pluginRoot` > `CLAUDE_HOME/HOME/USERPROFILE` デフォルト。
  - config.json サンプルと env サンプルを左右に並列表示。
  - 画像指示: `~/.viyv-claude/plugins/plugins/<id>` の簡易ツリーダイアグラム。

### 2.3 Features（SDKに効く要素を明示）
- Plugin Lifecycle: create/update/delete/list/importFromPath/importFromUrl を一本のフロー図で。Manager → FileSystem → Registry → Adapter → SDK。
- Components（SDK での見え方を記述）:
  - Commands: `commands/*.md`（frontmatter 例）。SDK では slash コマンドとして検出。
  - Agents: `agents/*.md`。サブエージェントとして自動認識。
  - Skills: `skills/<id>/SKILL.md`。model-invoked。`settingSources` が必要である旨を強調。
  - Hooks: `hooks/hooks.json`。イベント一覧（PreToolUse, PostToolUse, SessionStart, ...）を表に。
  - MCP: `.mcp.json`。`${CLAUDE_PLUGIN_ROOT}` 変数活用例を記載。
- Agent SDK Integration:
  - コード: `const plugins = await adapter.getSdkPlugins(['my-plugin']); query({ options: { plugins } })`
  - 図: Plugin ID → Adapter → `plugins: [{type:'local', path}]` → Agent SDK → Claude。

### 2.4 Guides
- Full Workflow: `examples/full-coverage/full-demo.ts` を4ステップで分解  
  1) create(全要素) 2) update(置換) 3) importFromPath/URL 4) delete + adapter  
  - 画像: ステップ進捗バー＋ターミナル出力スクショ。
- Team/CI:
  - コマンド例: `pnpm --filter @viyv-claude-plugin test -- --coverage`
  - `CLAUDE_PLUGIN_ROOT` を CI ワークスペースに向ける例。pnpm store キャッシュ案内。
- Troubleshooting:
  - 表形式: 事象/原因/対処。例: plugin.json 不足, 壊れた zip, 重複 ID, tsx IPC 権限エラー(macOS→`node --loader tsx full-demo.ts` 推奨)。

### 2.5 API Reference（SDK開発者が即使える）
- メソッド表: list/get/create/update/delete/importFromPath/importFromUrl/getSdkPlugins（引数・戻り値・throws）。
- 型ハイライト: CreatePluginInput / UpdatePluginInput / PluginJson / SkillInput / CommandInput / AgentInput / HooksInput / McpServersInput / PluginMeta（必須/任意を色分け）。
- フロー図: create → registry.json → plugins/<id>/… → adapter → SDK。
- 検索バー（クライアントサイドフィルタ）必須。

### 2.6 Examples
- basic-usage: create→list→delete を 3 コマステップ。`pnpm --filter basic-usage-example start` を強調。
- full-coverage: 全コンポーネント＋ import(path/URL)＋adapter。代替実行: `node --loader tsx full-demo.ts`。  
  - 画像: ターミナル出力スクショ（create/update/import/delete/adapter）。

### 2.7 Downloads & Versioning
- いまは workspace 利用。将来公開時の `pnpm add @viyv-claude-plugin` も記載。  
- SemVer ポリシー。破壊的変更はメジャーアップ。  
- CHANGELOG 予定地を明示。

### 2.8 FAQ
- plugin.json が無い→ `tree` で構造確認。  
- 重複 ID→ name を変えて再作成 or import 時に rename。  
- Agent SDK 連携→ adapter コードへのリンク。  
- Skills が発火しない→ `settingSources` と `allowedTools: ['Skill']` を確認。

### 2.9 Contact / Support
- brainfiber inc. 名義。連絡先（メール or Issue Tracker）を明記。

---

## 3. モノレポ構成（ポータルで明示）
- ルート: `viyv-claude-plugin/`
- パッケージ: `packages/core`（npm 名: `@viyv-claude-plugin`）
- サンプル: `examples/basic-usage`, `examples/full-coverage`
- ドキュメント: `docs/`（README ベース, getting-started, api-reference, 本ブリーフ）
- ワークスペース: `pnpm-workspace.yaml`
- コマンド: build `pnpm --filter @viyv-claude-plugin build`, test `pnpm --filter @viyv-claude-plugin test -- --coverage`
- ポータルから GitHub へリンクする際は上記パスを明示。

---

## 4. デザイン / アニメーション指針（高品位＋安心感）
- カラー: ベース #0B1220（ダークネイビー）、サブ #111827、アクセント #35BDF0（シアン）/ #6EE7B7（ティール）。ライトテーマは #F7FAFC ベース。  
- タイポ: 見出し Sora/Manrope Bold、本文 Inter/Space Grotesk、コード Fira Code。  
- レイアウト:  
  - ヒーロー: 左 CTA（「5分で試す」）、右 SVG アニメ（plugins → adapter → SDK）。  
  - 左サイドバー + 右目次のドキュメントレイアウト。  
  - ガラスモーフィックなカード。ホバーで 4px リフト、影強調。  
- アニメーション:  
  - セクションを 70–120ms ずらしでフェード＋アップ。  
  - ボタン/カード hover: translateY(-3px) & shadow 強化。  
  - フロー図の線上を粒子が 2s 周回。  
  - コードブロックのコピーアイコンを hover でフェードイン。  
- 画像・図（制作指示）  
  1) **ヒーロー図**: 左 Developer、中央 viyv-claude-plugin box、右 Agent SDK。背景ダーク＋回路線。  
  2) **構造図**: `plugins/<id>/commands|agents|skills|hooks|.mcp.json|.claude-plugin/plugin.json` のアイソメ図。  
  3) **Lifecycle 図**: create → update → import(path/URL) → adapter → SDK → delete のループ。  
  4) **SDK 連携図**: ID → Adapter → `plugins: [{type:'local', path}]` → query。  
  5) **設定優先順位図**: ENV > config.json > default を階段状に。  
  6) **トラブルシュート図**: 壊れた zip / 重複 ID / plugin.json 欠如をアイコン化。  
  7) **ターミナルスクショ**: `pnpm --filter full-coverage-example start` の出力（create/update/import/delete/adapter）。  
  8) **CI 図**: Git push → CI(build+test) → (将来) publish。
- ダーク/ライト両対応: CSS 変数で配色切替。SVG も2配色用意。

---

## 5. コンテンツ執筆トーン・粒度
- コピペで動くコード。前提（Node18+, pnpm）を行頭に。  
- 短文・能動態。「〜する」「〜で確認」。  
- 箇条書きは 3–5 点。1 行 1 メッセージ。

---

## 6. 参照するリポジトリ情報
- README（最新）: インストール、コード例、設定優先順位、Agent SDK 連携、カバレッジ。  
- docs: `getting-started.md`, `api-reference.md`。  
- examples: `basic-usage`, `full-coverage`。  
- カバレッジ（2025-11 時点）: Lines 99.08%, Funcs 97.14%, Branches 92.59%.

---

## 7. 完了の定義 (DoD)
- 全ページがローカルでビルド表示可能。  
- コードスニペットが `@viyv-claude-plugin` で最新 API と一致。  
- Home→Getting Started→Examples→API が 3 クリック以内。  
- 404 なし、Lighthouse (A11y/Best Practices/SEO/Perf) 90+。  
- 指定図版 8 点以上、ライト/ダーク両テーマで視認性良好。

---

## 8. タイムライン目安
- Day 1: 情報設計、ヒーロー＆ Getting Started 実装、ヒーロー図デザイン。  
- Day 2: Features/Guides/API/Examples 執筆＆図版（構造図・ライフサイクル図・設定図）。  
- Day 3: スタイリング、モーション適用、Lighthouse 改善、最終校正。

以上に沿って、brainfiber inc. 名義でポータルを制作してください。***
