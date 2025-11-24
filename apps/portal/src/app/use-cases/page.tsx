import styles from './page.module.css';
import CodeBlock from '@/components/CodeBlock';

const useCases = [
  {
    id: 'knowledge-bot',
    icon: '📚',
    title: '社内ナレッジBot',
    subtitle: 'FAQ・ドキュメント検索を自動化',
    description: '社内のFAQやドキュメントを検索するスキルを作成し、Claude Codeから直接ナレッジベースにアクセスできるようにします。',
    benefits: [
      '社内ドキュメントへの即座のアクセス',
      'よくある質問への自動回答',
      'チームの生産性向上',
    ],
    structure: `plugins/knowledge-bot/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   └── search-docs/
│       └── SKILL.md
└── .mcp.json  # 外部API連携用`,
    skillExample: `---
name: search-docs
description: Provides company knowledge base search. Auto-invoke when user mentions: FAQ, 社内ドキュメント, ナレッジベース, 検索. Do NOT use for: external search, web search.
---
# 社内ドキュメント検索

## 役割
社内のナレッジベースから関連ドキュメントを検索します。

## 使用方法
- 「〇〇について調べて」
- 「FAQで△△を検索」

## 検索対象
- 社内Wiki
- 技術ドキュメント
- FAQ集`,
  },
  {
    id: 'code-review',
    icon: '🔍',
    title: 'コードレビュー支援',
    subtitle: '品質チェックを自動化',
    description: 'エージェントを使ってコードの品質・セキュリティ・パフォーマンスを自動レビュー。チームのコードレビュープロセスを効率化します。',
    benefits: [
      'セキュリティ脆弱性の早期発見',
      'コーディング規約の自動チェック',
      'レビュー工数の削減',
    ],
    structure: `plugins/code-review/
├── .claude-plugin/
│   └── plugin.json
└── agents/
    ├── security-reviewer.md
    ├── performance-reviewer.md
    └── style-checker.md`,
    skillExample: `---
name: security-reviewer
description: Analyzes code for security vulnerabilities including injection, XSS, and authentication issues.
---
# Security Reviewer Agent

## 役割
コードのセキュリティ脆弱性を専門的にレビューします。

## チェック項目
1. **インジェクション脆弱性**
   - SQLインジェクション
   - コマンドインジェクション
   - XSS

2. **認証・認可**
   - 不適切なアクセス制御
   - セッション管理の問題

3. **機密情報**
   - ハードコードされた認証情報
   - 環境変数の露出

## 出力形式
- ファイル: path/to/file.ts
- 行: 42
- 重要度: Critical/Warning/Info
- 説明: 問題の詳細
- 推奨: 修正案`,
  },
  {
    id: 'api-integration',
    icon: '🔗',
    title: 'API連携スキル',
    subtitle: '外部サービスとの連携',
    description: 'Slack、Notion、GitHub等の外部サービスをClaude Codeから直接操作。MCPサーバーを使えばさらに高度な連携も可能です。',
    benefits: [
      '複数ツールの一元操作',
      'ワークフローの自動化',
      'コンテキスト切り替えの削減',
    ],
    structure: `plugins/api-tools/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   ├── slack-notify/
│   │   └── SKILL.md
│   └── notion-update/
│       └── SKILL.md
└── .mcp.json`,
    skillExample: `{
  "mcpServers": {
    "slack": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-slack"],
      "env": {
        "SLACK_TOKEN": "\${SLACK_TOKEN}"
      }
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "\${GITHUB_TOKEN}"
      }
    }
  }
}`,
  },
  {
    id: 'team-sharing',
    icon: '👥',
    title: 'チーム共有プラグイン',
    subtitle: 'GitHubでワンコマンド配布',
    description: 'GitHubリポジトリからワンコマンドでプラグインをインストール。チーム全員が同じツールセットを簡単に利用できます。',
    benefits: [
      'セットアップ時間の大幅削減',
      'チーム間の環境統一',
      'バージョン管理・更新の容易さ',
    ],
    structure: `# チームリポジトリ構造
team-plugins/
├── .claude-plugin/
│   └── marketplace.json
└── plugins/
    ├── team-standards/
    ├── project-templates/
    └── shared-skills/`,
    skillExample: `# インストール方法

# GitHubから直接インストール
npx viyv-claude-plugin install github:your-org/team-plugins --all

# 特定のプラグインのみ
npx viyv-claude-plugin install github:your-org/team-plugins team-standards

# 更新
npx viyv-claude-plugin update-plugin team-standards`,
  },
];

export default function UseCasesPage() {
  return (
    <main className={styles.main}>
      <div className="container">
        <div className={styles.header}>
          <span className={styles.label}>Use Cases</span>
          <h1 className={styles.title}>ユースケース</h1>
          <p className={styles.subtitle}>
            viyv-claude-plugin で実現できる具体的な活用例をご紹介します。
            <br />
            あなたのワークフローに合わせてカスタマイズしてください。
          </p>
        </div>

        <div className={styles.useCases}>
          {useCases.map((useCase, index) => (
            <section key={useCase.id} className={styles.useCase} id={useCase.id}>
              <div className={styles.useCaseHeader}>
                <span className={styles.useCaseIcon}>{useCase.icon}</span>
                <div>
                  <h2 className={styles.useCaseTitle}>{useCase.title}</h2>
                  <p className={styles.useCaseSubtitle}>{useCase.subtitle}</p>
                </div>
              </div>

              <p className={styles.useCaseDescription}>{useCase.description}</p>

              <div className={styles.benefits}>
                <h3 className={styles.benefitsTitle}>メリット</h3>
                <ul className={styles.benefitsList}>
                  {useCase.benefits.map((benefit, i) => (
                    <li key={i}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.codeExamples}>
                <div className={styles.codeExample}>
                  <h4>ディレクトリ構造</h4>
                  <CodeBlock filename="structure">{useCase.structure}</CodeBlock>
                </div>
                <div className={styles.codeExample}>
                  <h4>{useCase.id === 'api-integration' ? '.mcp.json' : useCase.id === 'team-sharing' ? '使用方法' : 'SKILL.md / Agent 例'}</h4>
                  <CodeBlock filename={useCase.id === 'api-integration' ? '.mcp.json' : useCase.id === 'team-sharing' ? 'terminal' : 'SKILL.md'}>
                    {useCase.skillExample}
                  </CodeBlock>
                </div>
              </div>

              {index < useCases.length - 1 && <hr className={styles.divider} />}
            </section>
          ))}
        </div>

        <div className={styles.cta}>
          <h2 className={styles.ctaTitle}>今すぐ始めましょう</h2>
          <p className={styles.ctaText}>
            コマンド一つでプラグイン開発を始められます
          </p>
          <div className={styles.ctaCode}>
            <code>npx viyv-claude-plugin new my-plugin</code>
          </div>
          <a href="/getting-started" className={styles.ctaButton}>
            Getting Started
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </main>
  );
}
