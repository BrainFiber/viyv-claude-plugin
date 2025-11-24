# Multi-Plugins Example

複数プラグインを同時に登録し、ユーザーのリクエストに応じて暗黙的に適切なプラグインが呼び出されることを確認するテストです。

## シナリオ: フルスタック開発支援

3つの独立したプラグインを用意し、それぞれがスキル + サブエージェントを持ちます。

| プラグイン | スキル | サブエージェント | 用途 |
|-----------|--------|-----------------|------|
| frontend-toolkit | react-patterns | component-generator | React開発支援 |
| backend-toolkit | api-guidelines | api-designer | API開発支援 |
| quality-assurance | testing-standards | test-generator | テスト支援 |

## 暗黙的呼び出しの仕組み

1. ユーザーがリクエストを送信
2. AI がリクエスト内容から適切なスキルを選択
3. スキルがサブエージェントを呼び出すよう指示
4. Task tool 経由でサブエージェントが実行

```
User: "Reactコンポーネントを作成して"
    ↓
AI がスキルを選択
    ↓
Skill: react-patterns (frontend-toolkit)
    ↓ スキルの指示に従う
Agent: component-generator
```

## 実行方法

```bash
# デフォルト（フロントエンド系）
pnpm test

# シナリオ別
pnpm test:frontend    # "Please create a React button component..."
pnpm test:backend     # "Please design a REST API for user authentication..."
pnpm test:testing     # "Please write unit tests for a function..."
```

## 期待される出力

```
========================================
Multiple Plugins Implicit Invocation Test
========================================

Scenario: Frontend Development
Prompt: "Please create a React button component..."
Expected: frontend-toolkit → react-patterns → component-generator

Creating 3 plugins...

  ✓ frontend-toolkit (frontend-toolkit)
  ✓ backend-toolkit (backend-toolkit)
  ✓ quality-assurance (quality-assurance)

--- Executing Query ---

🎯 SKILL: frontend-toolkit:react-patterns
🚀 AGENT: frontend-toolkit:component-generator

========== SUMMARY ==========
Skills invoked: frontend-toolkit:react-patterns
Agents invoked: frontend-toolkit:component-generator

--- Verification ---
Expected skill (react-patterns): ✅ MATCHED
Expected agent (component-generator): ✅ MATCHED

✅ SUCCESS: Implicit invocation worked!
   frontend-toolkit → react-patterns → component-generator
```

## スキルの description が重要

暗黙的呼び出しを機能させるには、スキルの `description` フィールドに適切なトリガー条件を記載します:

```markdown
---
name: react-patterns
description: React component patterns and best practices. Use this when asked to create React components, implement UI features, or review frontend code.
---
```

AI はこの description を見て、ユーザーのリクエストに最も適したスキルを選択します。

## 複数プラグインが同時に呼ばれる場合

複合的なリクエスト（例：「新機能を実装して、テストも書いて」）の場合、複数のプラグインが順次呼び出される可能性があります。

## ファイル構成

```
examples/multi-plugins/
├── README.md                 # このファイル
├── package.json              # パッケージ設定
└── multi-plugin-test.ts      # メインテストファイル
```
