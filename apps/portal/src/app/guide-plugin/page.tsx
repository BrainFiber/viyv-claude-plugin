import Terminal from '@/components/Terminal';
import CodeBlock from '@/components/CodeBlock';
import styles from './page.module.css';

const skills = [
  { name: 'cli-overview', desc: 'CLI全コマンド一覧と使い方概要' },
  { name: 'cli-new', desc: 'newコマンドでプラグインプロジェクトを作成' },
  { name: 'cli-setup', desc: 'setupコマンドでマーケットプレイスを登録' },
  { name: 'cli-install', desc: 'installコマンドでプラグインをインストール' },
  { name: 'plugin-structure', desc: 'プラグインのディレクトリ構造とファイル配置' },
  { name: 'create-skill', desc: 'スキルファイル(SKILL.md)の作成方法' },
  { name: 'create-command', desc: 'スラッシュコマンドの作成方法' },
  { name: 'create-agent', desc: 'エージェント定義の作成方法' },
  { name: 'create-hooks', desc: 'hooks.jsonフック設定の作成方法' },
  { name: 'create-mcp', desc: 'MCPサーバー設定の作成方法' },
  { name: 'create-plugin-json', desc: 'plugin.json設定ファイルの書き方' },
  { name: 'core-api', desc: 'TypeScriptからCore APIを利用する方法' },
];

export default function GuidePluginPage() {
  return (
    <main className={styles.main}>
      <div className="container">
        <div className={styles.header}>
          <span className={styles.label}>Guide Plugin</span>
          <h1 className={styles.title}>Claude Code でスキル開発を加速</h1>
          <p className={styles.subtitle}>
            viyv-claude-plugin-guide をインストールすると、Claude Code 内で
            プラグイン開発のベストプラクティスを即座に参照できます。
            スキル作成が爆速になります。
          </p>
        </div>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>インストール</h2>
          <p className={styles.sectionDesc}>
            GitHub リポジトリから直接インストールできます。
          </p>
          <Terminal
            title="Install Guide Plugin"
            lines={[
              { type: 'command', text: 'npx viyv-claude-plugin install https://github.com/BrainFiber/viyv-claude-plugin' },
              { type: 'output', text: 'Installed plugin: viyv-claude-plugin-guide (1.0.0)' },
              { type: 'output', text: '' },
              { type: 'command', text: 'npx viyv-claude-plugin setup' },
              { type: 'output', text: 'Registered marketplace: local-marketplace' },
              { type: 'output', text: '' },
              { type: 'comment', text: 'Claude Code を再起動すると使えるようになります' },
            ]}
          />
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>何ができるようになるか</h2>
          <div className={styles.benefits}>
            <div className={styles.benefit}>
              <div className={styles.benefitIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              </div>
              <div>
                <h3>スキル開発が爆速に</h3>
                <p>Claude Code に「スキルを作って」と言うだけで、正しい形式のSKILL.mdが生成されます。</p>
              </div>
            </div>
            <div className={styles.benefit}>
              <div className={styles.benefitIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <div>
                <h3>ドキュメント検索不要</h3>
                <p>CLIコマンドやファイル構造を忘れても、Claude に聞けば即座に回答が得られます。</p>
              </div>
            </div>
            <div className={styles.benefit}>
              <div className={styles.benefitIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div>
                <h3>ベストプラクティスを自動適用</h3>
                <p>description の書き方、ファイル配置など、推奨パターンが自動的に適用されます。</p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>使用例</h2>
          <div className={styles.examples}>
            <div className={styles.example}>
              <h4>スキルを作成</h4>
              <div className={styles.chatExample}>
                <div className={styles.userMessage}>
                  <span className={styles.userLabel}>You</span>
                  <p>「コードレビュー」というスキルを作成して。PRの差分を分析してレビューコメントを生成する機能にして。</p>
                </div>
                <div className={styles.assistantMessage}>
                  <span className={styles.assistantLabel}>Claude</span>
                  <p>skill:create-skill を使用してスキルを作成します...</p>
                </div>
              </div>
              <CodeBlock filename="skills/code-review/SKILL.md">{`---
name: code-review
description: Provides PR code review. Auto-invoke when user mentions: review, レビュー, PR, diff. Do NOT use for: unit tests, refactoring.
---
# コードレビュースキル

## 役割
PRの差分を分析し、改善点やバグの可能性を指摘します。

## 使用方法
「このPRをレビューして」と指示してください。`}</CodeBlock>
            </div>

            <div className={styles.example}>
              <h4>CLIコマンドを確認</h4>
              <div className={styles.chatExample}>
                <div className={styles.userMessage}>
                  <span className={styles.userLabel}>You</span>
                  <p>GitHubからプラグインをインストールするコマンドは？</p>
                </div>
                <div className={styles.assistantMessage}>
                  <span className={styles.assistantLabel}>Claude</span>
                  <p>skill:cli-install を参照します...</p>
                  <code>npx viyv-claude-plugin install https://github.com/user/repo</code>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>含まれるスキル一覧</h2>
          <p className={styles.sectionDesc}>
            以下の{skills.length}個のスキルが含まれています。Claude Code が自動的に適切なスキルを選択します。
          </p>
          <div className={styles.skillsGrid}>
            {skills.map((skill) => (
              <div key={skill.name} className={styles.skillCard}>
                <code className={styles.skillName}>{skill.name}</code>
                <p className={styles.skillDesc}>{skill.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>viyv-claude-plugin との連携</h2>
          <p className={styles.sectionDesc}>
            Guide Plugin と viyv-claude-plugin CLI を組み合わせることで、
            スキル開発からチーム展開まで一気通貫のワークフローが実現します。
          </p>
          <Terminal
            title="Complete Workflow"
            lines={[
              { type: 'comment', text: '1. Guide Plugin をインストール' },
              { type: 'command', text: 'npx viyv-claude-plugin install https://github.com/BrainFiber/viyv-claude-plugin' },
              { type: 'output', text: '' },
              { type: 'comment', text: '2. マーケットプレイスをセットアップ' },
              { type: 'command', text: 'npx viyv-claude-plugin setup' },
              { type: 'output', text: '' },
              { type: 'comment', text: '3. 新規プロジェクトを作成' },
              { type: 'command', text: 'npx viyv-claude-plugin new my-skills' },
              { type: 'output', text: '' },
              { type: 'comment', text: '4. Claude Code でスキルを開発（Guide が自動支援）' },
              { type: 'comment', text: '   「デプロイスキルを作成して」→ 正しい形式で生成' },
              { type: 'output', text: '' },
              { type: 'comment', text: '5. チームに展開' },
              { type: 'command', text: 'git push' },
            ]}
          />
        </section>
      </div>
    </main>
  );
}
