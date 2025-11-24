# Subagents Example

Claude Agent SDK でサブエージェントを使用する例です。

## 重要な発見

### サブエージェントは暗黙的に呼び出されない

サブエージェントを定義しても、**明示的な指示がないと呼び出されません**。

```
// ❌ これだけでは code-reviewer は呼び出されない
Prompt: "Please review this code"
Result: メインエージェントが直接処理

// ✅ スキル経由で指示することで呼び出される
Skill の指示: "Use the code-reviewer agent for detailed analysis"
Result: Skill → Task tool → code-reviewer agent
```

### スキル経由でサブエージェントを呼び出す

スキルの内容に「特定のエージェントを使用せよ」と記載することで、AI が Task tool 経由でサブエージェントを呼び出します。

## テストパターン

### 1. スキル → サブエージェント（単体）

```bash
pnpm skill-test           # 暗黙的呼び出し
pnpm skill-test --explicit # 明示的呼び出し
```

フロー:
```
User Request → Skill → Subagent (code-reviewer)
```

結果:
```
🎯 SKILL INVOKED: code-quality:security-standards
🚀 SUBAGENT INVOKED: Type: code-reviewer
✅ SUCCESS: Skill → Subagent chain worked!
```

### 2. スキル → 複数サブエージェント（順次実行）

```bash
pnpm workflow-test
```

フロー:
```
User Request
    ↓
Skill (security-review)
    ↓ スキルの指示で直接サブエージェントを呼び出す
code-scanner → security-analyzer → report-generator
```

結果:
```
🎯 SKILL INVOKED: security-workflow:security-review
🚀 AGENT INVOKED: security-workflow:code-scanner
🚀 AGENT INVOKED: security-workflow:security-analyzer
🚀 AGENT INVOKED: security-workflow:report-generator

✅ SUCCESS: Full workflow executed!
   Skill → code-scanner → security-analyzer → report-generator
```

## SDK の制約

### plugin.json に `agents` フィールドを含めない

`plugin.json` に `agents` フィールドを設定すると、SDK がプラグインを認識しなくなる問題があります。

```json
// ❌ 動作しない
{
  "name": "my-plugin",
  "agents": "./agents",
  "skills": "./skills"
}

// ✅ 動作する（agents/skills は自動検出される）
{
  "name": "my-plugin"
}
```

viyv-claude-plugin はこの制約を考慮し、`plugin.json` に `agents` と `skills` フィールドを含めません。ディレクトリ構造は作成されますが、SDK が自動検出します。

## ファイル構成

```
examples/subagents/
├── README.md           # このファイル
├── package.json        # パッケージ設定
├── skill-to-agent.ts   # スキル→サブエージェント（単体）
└── workflow-test.ts    # スキル→複数サブエージェント（順次）
```
