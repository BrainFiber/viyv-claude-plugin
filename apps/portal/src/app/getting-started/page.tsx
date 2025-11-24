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
            <h1 className={styles.title}>5分でチーム展開</h1>
            <p className={styles.lead}>
              既存プロジェクトにプラグインを配置し、チーム全員で共有する手順です。
            </p>
          </div>

          <section className={styles.section}>
            <div className={styles.stepHeader}>
              <span className={styles.stepNumber}>01</span>
              <h2 className={styles.heading}>既存プロジェクトでセットアップ</h2>
            </div>
            <p className={styles.text}>
              <strong>既存プロジェクトのルートディレクトリ</strong>で <code>new</code> コマンドを実行します。
              <code>.claude-plugin/</code> と <code>plugins/</code> が作成され、既存のソースと一緒に管理できます。
            </p>
            <Terminal
              title="既存プロジェクトで実行"
              lines={[
                { type: 'comment', text: 'プロジェクトのルートで実行' },
                { type: 'command', text: 'cd your-project' },
                { type: 'command', text: 'npx viyv-claude-plugin new my-plugin' },
                { type: 'output', text: '' },
                { type: 'output', text: 'Created new plugin scaffold at ./' },
                { type: 'output', text: '' },
                { type: 'output', text: '  .claude-plugin/marketplace.json' },
                { type: 'output', text: '  plugins/my-plugin/.claude-plugin/plugin.json' },
                { type: 'output', text: '  plugins/my-plugin/skills/sample-skill/SKILL.md' },
              ]}
            />

            <div className={styles.fileStructure}>
              <h3 className={styles.subheading}>生成されるファイル構造</h3>
              <CodeBlock filename="your-project/">{`your-project/              # 既存のプロジェクト
├── .claude-plugin/
│   └── marketplace.json   # マーケットプレイス定義
├── plugins/
│   └── my-plugin/         # プラグイン本体
│       ├── .claude-plugin/plugin.json
│       ├── skills/
│       ├── commands/
│       └── agents/
├── src/                   # 既存のソースコード
├── package.json
└── ...`}</CodeBlock>
              <p className={styles.text} style={{ marginTop: '1rem' }}>
                プラグインはリポジトリ内に配置されるため、<strong>git で管理・共有</strong>できます。
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.stepHeader}>
              <span className={styles.stepNumber}>02</span>
              <h2 className={styles.heading}>プラグインを編集</h2>
            </div>
            <p className={styles.text}>
              生成されたファイルを編集して、スキル・コマンド・エージェントを追加します。
              不要なサンプルファイルは削除してください。
            </p>

            <div className={styles.exampleGrid}>
              <div className={styles.example}>
                <h4>スキルの例</h4>
                <CodeBlock filename="skills/search/SKILL.md">{`---
name: search-docs
description: Provides document search. Auto-invoke when user mentions: search, 検索, document. Do NOT use for: web search.
---
# ドキュメント検索スキル

## 役割
プロジェクト内のドキュメントを検索します。

## 使用方法
「〇〇を検索して」と指示してください。`}</CodeBlock>
              </div>

              <div className={styles.example}>
                <h4>コマンドの例</h4>
                <CodeBlock filename="commands/deploy.md">{`---
name: deploy
description: Deploy to production environment
---
# /deploy コマンド

## 概要
プロダクション環境へのデプロイを実行します。

## 使用方法
\`\`\`
/deploy
\`\`\`

## 処理内容
1. テストの実行
2. ビルド
3. デプロイ`}</CodeBlock>
              </div>
            </div>

            <div className={`${styles.tip} glass`}>
              <div className={styles.tipIcon}>💡</div>
              <div>
                <h4 className={styles.tipTitle}>スキルが呼び出されるためのポイント</h4>
                <p className={styles.tipText}>
                  <code>description</code> フィールドに <code>Auto-invoke when user mentions: [キーワード]</code> と
                  <code>Do NOT use for: [除外条件]</code> を含めると、Claude Code が適切なタイミングでスキルを呼び出します。
                </p>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.stepHeader}>
              <span className={styles.stepNumber}>03</span>
              <h2 className={styles.heading}>Claude Code に登録</h2>
            </div>
            <p className={styles.text}>
              <code>setup</code> コマンドでマーケットプレイスをClaude Codeに登録します。
            </p>
            <Terminal
              title="Register with Claude Code"
              lines={[
                { type: 'command', text: 'cd my-plugin' },
                { type: 'command', text: 'npx viyv-claude-plugin setup' },
                { type: 'output', text: 'Registered marketplace: my-plugin' },
              ]}
            />

            <div className={`${styles.success} glass`}>
              <div className={styles.successIcon}>✅</div>
              <div>
                <h4 className={styles.successTitle}>登録完了！</h4>
                <p className={styles.successText}>
                  Claude Code でプラグインが使えるようになりました。
                  <code>/</code> でコマンド、<code>skill:</code> でスキルを呼び出せます。
                </p>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.stepHeader}>
              <span className={styles.stepNumber}>04</span>
              <h2 className={styles.heading}>チームに展開</h2>
            </div>
            <p className={styles.text}>
              プラグインは<strong>リポジトリ内に配置</strong>されているため、
              チームメンバーは <code>git pull</code> 後に <code>install .</code> するだけで同じスキルを適用できます。
            </p>

            <Terminal
              title="チームメンバーの適用手順"
              lines={[
                { type: 'comment', text: '開発者: 変更をコミット & プッシュ' },
                { type: 'command', text: 'git add .claude-plugin plugins' },
                { type: 'command', text: 'git commit -m "Add Claude Code plugins"' },
                { type: 'command', text: 'git push' },
                { type: 'output', text: '' },
                { type: 'comment', text: 'チームメンバー: pull 後に install するだけ' },
                { type: 'command', text: 'git pull' },
                { type: 'command', text: 'npx viyv-claude-plugin install .' },
                { type: 'output', text: 'Installed: my-plugin' },
              ]}
            />

            <div className={`${styles.success} glass`}>
              <div className={styles.successIcon}>✅</div>
              <div>
                <h4 className={styles.successTitle}>チーム全員が同じスキルを利用可能</h4>
                <p className={styles.successText}>
                  リポジトリを共有するメンバーなら、<code>install .</code> でスキルが適用されます。
                  スキルの更新も <code>git pull</code> → <code>install .</code> で即反映。
                </p>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>次のステップ</h2>
            <div className={styles.nextSteps}>
              <a href="/cli" className={styles.nextStep}>
                <span className={styles.nextStepIcon}>📖</span>
                <div>
                  <h4>CLI リファレンス</h4>
                  <p>全コマンドの詳細オプション</p>
                </div>
              </a>
              <a href="/use-cases" className={styles.nextStep}>
                <span className={styles.nextStepIcon}>💡</span>
                <div>
                  <h4>ユースケース</h4>
                  <p>具体的な活用例</p>
                </div>
              </a>
              <a href="/api" className={styles.nextStep}>
                <span className={styles.nextStepIcon}>🔧</span>
                <div>
                  <h4>API リファレンス</h4>
                  <p>プログラマティックな利用</p>
                </div>
              </a>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
