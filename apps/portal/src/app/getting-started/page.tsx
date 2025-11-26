import Link from 'next/link';
import Terminal from '@/components/Terminal';
import CodeBlock from '@/components/CodeBlock';
import styles from './page.module.css';

export default function GettingStarted() {
  return (
    <main className={styles.main}>
      <div className="container">
        <div className={styles.wrapper}>
          <div className={styles.header}>
            <span className={styles.label}>Getting Started</span>
            <h1 className={styles.title}>5分でスキル作成</h1>
            <p className={styles.lead}>
              Claude Code用のスキルを作成し、すぐに利用開始できます。
            </p>
          </div>

          {/* Step 0: 初回セットアップ */}
          <section className={styles.section}>
            <div className={styles.stepHeader}>
              <span className={`${styles.stepNumber} ${styles.stepSetup}`}>00</span>
              <h2 className={styles.heading}>初回セットアップ</h2>
              <span className={styles.badge}>初回のみ</span>
            </div>
            <p className={styles.text}>
              最初に1回だけ実行します。Guide Plugin をインストールした後、setup コマンドでマーケットプレイスを登録します。
            </p>
            <Terminal
              title="初回セットアップ"
              lines={[
                { type: 'command', text: 'npx viyv-claude-plugin install https://github.com/BrainFiber/viyv-claude-plugin' },
                { type: 'output', text: 'Installed: viyv-claude-plugin-guide' },
                { type: 'output', text: '' },
                { type: 'command', text: 'npx viyv-claude-plugin setup' },
                { type: 'output', text: 'Registered marketplace: local-marketplace' },
                { type: 'output', text: '' },
                { type: 'success', text: 'セットアップ完了!' },
              ]}
            />

            <div className={`${styles.tip} glass`}>
              <div className={styles.tipIcon}>⚡</div>
              <div>
                <h4 className={styles.tipTitle}>Guide Plugin とは？</h4>
                <p className={styles.tipText}>
                  Claude Code 内でプラグイン開発のベストプラクティスを教えてくれます。
                  「スキルを作成して」と言うだけで正しい形式の SKILL.md が生成されます。
                </p>
              </div>
            </div>
          </section>

          {/* Step 1: プラグイン作成 */}
          <section className={styles.section}>
            <div className={styles.stepHeader}>
              <span className={styles.stepNumber}>01</span>
              <h2 className={styles.heading}>プラグインを作成</h2>
            </div>
            <p className={styles.text}>
              単独で作成する場合も、既存プロジェクト内で作成する場合も同じコマンドです。
            </p>

            <div className={styles.optionGrid}>
              <div className={styles.option}>
                <h4>単独で作成</h4>
                <Terminal
                  title="任意のディレクトリで実行"
                  lines={[
                    { type: 'command', text: 'npx viyv-claude-plugin new my-plugin' },
                    { type: 'output', text: '' },
                    { type: 'output', text: 'Created plugin scaffold:' },
                    { type: 'output', text: '  my-plugin/.claude-plugin/plugin.json' },
                    { type: 'output', text: '  my-plugin/skills/sample/SKILL.md' },
                  ]}
                />
              </div>
              <div className={styles.option}>
                <h4>プロジェクト内で作成</h4>
                <Terminal
                  title="既存プロジェクトのルートで実行"
                  lines={[
                    { type: 'command', text: 'cd your-project' },
                    { type: 'command', text: 'npx viyv-claude-plugin new my-plugin' },
                    { type: 'output', text: '' },
                    { type: 'output', text: 'Created plugin scaffold:' },
                    { type: 'output', text: '  .claude-plugin/marketplace.json' },
                    { type: 'output', text: '  plugins/my-plugin/...' },
                  ]}
                />
              </div>
            </div>

            <div className={`${styles.tip} glass`}>
              <div className={styles.tipIcon}>💡</div>
              <div>
                <h4 className={styles.tipTitle}>プロジェクト内で作成するメリット</h4>
                <p className={styles.tipText}>
                  スキルにコードを含める場合、該当コードの確認が簡単です。
                  テストも可能で、gitでチームと共有もできます。
                </p>
              </div>
            </div>
          </section>

          {/* Step 2: スキル編集 */}
          <section className={styles.section}>
            <div className={styles.stepHeader}>
              <span className={styles.stepNumber}>02</span>
              <h2 className={styles.heading}>スキルを編集</h2>
            </div>
            <p className={styles.text}>
              生成されたSKILL.mdをMarkdown形式で編集します。
              YAMLフロントマターで名前と説明を定義し、本文でスキルの内容を記述します。
            </p>

            <CodeBlock filename="skills/search/SKILL.md">{`---
name: search-docs
description: Provides document search. Auto-invoke when user mentions: search, 検索, document.
---
# ドキュメント検索スキル

## 役割
プロジェクト内のドキュメントを検索します。

## 使用方法
「〇〇を検索して」と指示してください。

## 検索対象
- README.md
- docs/ 配下のファイル
- ソースコード内のコメント`}</CodeBlock>
          </section>

          {/* Step 3: インストール */}
          <section className={styles.section}>
            <div className={styles.stepHeader}>
              <span className={styles.stepNumber}>03</span>
              <h2 className={styles.heading}>インストール</h2>
            </div>
            <p className={styles.text}>
              スキルを編集したら、<code>install .</code> でインストールします。
            </p>
            <Terminal
              title="プラグインをインストール"
              lines={[
                { type: 'command', text: 'npx viyv-claude-plugin install .' },
                { type: 'output', text: 'Installed: my-plugin' },
              ]}
            />
          </section>

          {/* Step 4: アクティベート */}
          <section className={styles.section}>
            <div className={styles.stepHeader}>
              <span className={styles.stepNumber}>04</span>
              <h2 className={styles.heading}>アクティベート</h2>
            </div>
            <p className={styles.text}>
              Claude Codeを起動し、Pluginメニューからスキルをアクティベートします。
            </p>

            <div className={`${styles.success} glass`}>
              <div className={styles.successIcon}>✅</div>
              <div>
                <h4 className={styles.successTitle}>利用開始!</h4>
                <p className={styles.successText}>
                  Claude Code で <code>skill:</code> と入力するとスキル一覧が表示されます。
                  スキル名で呼び出すこともできます。
                </p>
              </div>
            </div>
          </section>

          {/* チーム共有（オプション） */}
          <section className={styles.section}>
            <div className={styles.stepHeader}>
              <span className={styles.stepNumber}>+</span>
              <h2 className={styles.heading}>チームに共有（オプション）</h2>
            </div>
            <p className={styles.text}>
              プロジェクト内で作成した場合、gitで共有できます。
              チームメンバーは <code>pull</code> 後に <code>install .</code> するだけで同じスキルを適用できます。
            </p>

            <Terminal
              title="チームメンバーの適用手順"
              lines={[
                { type: 'comment', text: 'チームメンバーは pull 後にこれだけ' },
                { type: 'command', text: 'git pull' },
                { type: 'command', text: 'npx viyv-claude-plugin install .' },
                { type: 'output', text: 'Installed: my-plugin' },
              ]}
            />
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>次のステップ</h2>
            <div className={styles.nextSteps}>
              <Link href="/guide-plugin" className={styles.nextStep}>
                <span className={styles.nextStepIcon}>⚡</span>
                <div>
                  <h4>Guide Plugin</h4>
                  <p>スキル開発を爆速で</p>
                </div>
              </Link>
              <Link href="/cli" className={styles.nextStep}>
                <span className={styles.nextStepIcon}>📖</span>
                <div>
                  <h4>CLI リファレンス</h4>
                  <p>全コマンドの詳細</p>
                </div>
              </Link>
              <Link href="/use-cases" className={styles.nextStep}>
                <span className={styles.nextStepIcon}>💡</span>
                <div>
                  <h4>ユースケース</h4>
                  <p>具体的な活用例</p>
                </div>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
