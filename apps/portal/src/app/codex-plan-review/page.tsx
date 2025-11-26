import Terminal from '@/components/Terminal';
import CodeBlock from '@/components/CodeBlock';
import styles from './page.module.css';

const components = [
  { name: 'plan-review', type: 'Skill', desc: 'プランレビューのトリガー。「codex でレビューして」で起動' },
  { name: 'codex-plan-reviewer', type: 'Agent', desc: 'codex exec を実行してプランをレビュー' },
];

const reviewCriteria = [
  { name: 'Feasibility', desc: '実現可能性 - 技術的に実現可能か' },
  { name: 'Completeness', desc: '完全性 - 必要なステップがすべて含まれているか' },
  { name: 'Order', desc: '実行順序 - 適切な順序で計画されているか' },
  { name: 'Risks', desc: 'リスク - 潜在的な問題点はないか' },
  { name: 'Improvements', desc: '改善提案 - より良いアプローチはないか' },
];

export default function CodexPlanReviewPage() {
  return (
    <main className={styles.main}>
      <div className="container">
        <div className={styles.header}>
          <span className={styles.label}>Codex Plan Review</span>
          <h1 className={styles.title}>Codex でプランをレビュー</h1>
          <p className={styles.subtitle}>
            OpenAI Codex CLI を活用して、Claude Code で作成したプランの品質を向上させます。
            別の AI による客観的なレビューで、見落としやリスクを事前に発見できます。
          </p>
        </div>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>前提条件</h2>
          <p className={styles.sectionDesc}>
            このプラグインを使用するには、OpenAI Codex CLI がインストールされている必要があります。
          </p>
          <Terminal
            title="Install Codex CLI"
            lines={[
              { type: 'comment', text: 'Codex CLI をインストール（まだの場合）' },
              { type: 'command', text: 'npm install -g @openai/codex' },
              { type: 'output', text: '' },
              { type: 'comment', text: '動作確認' },
              { type: 'command', text: 'codex --version' },
              { type: 'output', text: '1.0.0' },
            ]}
          />
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>インストール</h2>
          <p className={styles.sectionDesc}>
            GitHub リポジトリから直接インストールできます。
          </p>
          <Terminal
            title="Install Plugin"
            lines={[
              { type: 'command', text: 'npx viyv-claude-plugin install https://github.com/BrainFiber/viyv-claude-plugin' },
              { type: 'output', text: 'Installed plugin: codex-plan-review (1.0.0)' },
              { type: 'output', text: '' },
              { type: 'command', text: 'npx viyv-claude-plugin setup' },
              { type: 'output', text: 'Registered marketplace: local-marketplace' },
              { type: 'output', text: '' },
              { type: 'comment', text: '再起動して、Claude Code のアクティベートを行うと使えるようになります' },
            ]}
          />
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>何ができるようになるか</h2>
          <div className={styles.benefits}>
            <div className={styles.benefit}>
              <div className={styles.benefitIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 11l3 3L22 4"/>
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                </svg>
              </div>
              <div>
                <h3>プランの品質向上</h3>
                <p>見落としやリスクを自動検出。実装前に問題点を発見して修正できます。</p>
              </div>
            </div>
            <div className={styles.benefit}>
              <div className={styles.benefitIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <div>
                <h3>客観的なレビュー</h3>
                <p>別の AI による第三者視点でのチェック。異なる観点からの指摘が得られます。</p>
              </div>
            </div>
            <div className={styles.benefit}>
              <div className={styles.benefitIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              </div>
              <div>
                <h3>改善提案を即座に取得</h3>
                <p>修正案が具体的に提示されるため、すぐにプランを改善できます。</p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>使用例</h2>
          <div className={styles.examples}>
            <div className={styles.example}>
              <h4>機能実装のプランをレビュー</h4>
              <div className={styles.chatExample}>
                <div className={styles.userMessage}>
                  <span className={styles.userLabel}>You</span>
                  <p>認証機能を実装するプランを作成して。プランモードで。</p>
                </div>
                <div className={styles.assistantMessage}>
                  <span className={styles.assistantLabel}>Claude</span>
                  <p>プランを作成しました。以下の内容で計画ファイルに保存しました...</p>
                </div>
                <div className={styles.userMessage}>
                  <span className={styles.userLabel}>You</span>
                  <p>codex でレビューして</p>
                </div>
                <div className={styles.assistantMessage}>
                  <span className={styles.assistantLabel}>Claude</span>
                  <p>plan-review スキルを使用してプランをレビューします...</p>
                </div>
              </div>
              <CodeBlock filename="Review Result">{`## Review Results

### Strengths
- 認証フローが明確に定義されている
- セキュリティ考慮がされている

### Areas for Improvement
- エラーハンドリングの詳細が不足
- テスト計画が含まれていない

### Risks
- セッション管理の実装が複雑になる可能性

## Revised Plan
1. データベーススキーマ設計
2. 認証ミドルウェア実装
3. エラーハンドリング追加  ← NEW
4. ユニットテスト作成     ← NEW
5. API エンドポイント実装
6. フロントエンド統合`}</CodeBlock>
            </div>

            <div className={styles.example}>
              <h4>リファクタリング計画のチェック</h4>
              <div className={styles.chatExample}>
                <div className={styles.userMessage}>
                  <span className={styles.userLabel}>You</span>
                  <p>このリファクタリング計画をレビューしてほしい。codex で。</p>
                </div>
                <div className={styles.assistantMessage}>
                  <span className={styles.assistantLabel}>Claude</span>
                  <p>codex-plan-reviewer エージェントを起動してレビューを実行します...</p>
                </div>
              </div>
              <p className={styles.sectionDesc}>
                大規模なリファクタリング計画では、依存関係の見落としや
                実行順序の問題を事前に発見できます。
              </p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>ワークフロー</h2>
          <p className={styles.sectionDesc}>
            プランレビューは以下の流れで実行されます。
          </p>
          <Terminal
            title="Workflow"
            lines={[
              { type: 'comment', text: '1. プランを作成（Claude Code）' },
              { type: 'output', text: '   └─ 計画ファイルに保存' },
              { type: 'output', text: '' },
              { type: 'comment', text: '2. 「codex でレビューして」と依頼' },
              { type: 'output', text: '   └─ plan-review スキルが起動' },
              { type: 'output', text: '' },
              { type: 'comment', text: '3. codex-plan-reviewer エージェントが実行' },
              { type: 'output', text: '   └─ codex exec でプランを分析' },
              { type: 'output', text: '' },
              { type: 'comment', text: '4. レビュー結果を返却' },
              { type: 'output', text: '   ├─ 強み' },
              { type: 'output', text: '   ├─ 改善点' },
              { type: 'output', text: '   ├─ リスク' },
              { type: 'output', text: '   └─ 改訂版プラン' },
              { type: 'output', text: '' },
              { type: 'comment', text: '5. プランを改善して実装開始' },
            ]}
          />
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>レビュー観点</h2>
          <p className={styles.sectionDesc}>
            Codex は以下の観点からプランを分析します。
          </p>
          <div className={styles.skillsGrid}>
            {reviewCriteria.map((criteria) => (
              <div key={criteria.name} className={styles.skillCard}>
                <code className={styles.skillName}>{criteria.name}</code>
                <p className={styles.skillDesc}>{criteria.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>含まれるコンポーネント</h2>
          <p className={styles.sectionDesc}>
            このプラグインには以下のコンポーネントが含まれています。
          </p>
          <div className={styles.skillsGrid}>
            {components.map((comp) => (
              <div key={comp.name} className={styles.skillCard}>
                <code className={styles.skillName}>{comp.type}: {comp.name}</code>
                <p className={styles.skillDesc}>{comp.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>トリガーワード</h2>
          <p className={styles.sectionDesc}>
            以下のキーワードで plan-review スキルが自動的に起動します。
          </p>
          <div className={styles.skillsGrid}>
            <div className={styles.skillCard}>
              <code className={styles.skillName}>codex review</code>
              <p className={styles.skillDesc}>「codex でレビューして」「codex review」</p>
            </div>
            <div className={styles.skillCard}>
              <code className={styles.skillName}>plan review</code>
              <p className={styles.skillDesc}>「このプランをレビューして」「plan review」</p>
            </div>
            <div className={styles.skillCard}>
              <code className={styles.skillName}>improve plan</code>
              <p className={styles.skillDesc}>「プランを改善して」「improve plan」</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
