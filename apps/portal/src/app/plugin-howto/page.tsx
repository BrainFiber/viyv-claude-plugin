import Link from 'next/link';
import Terminal from '@/components/Terminal';
import CodeBlock from '@/components/CodeBlock';
import styles from './page.module.css';

const tocItems = [
  { id: 'what-is-plugin', number: '1', title: 'Claude Code Plugins とは？' },
  { id: 'prerequisites', number: '2', title: '前提条件' },
  { id: 'using-plugins', number: '3', title: '既存プラグインを使う' },
  { id: 'what-plugins-add', number: '4', title: 'プラグインで何が増えるのか' },
  { id: 'use-cases', number: '5', title: 'ユースケース' },
  { id: 'best-practices', number: '6', title: 'チーム運用ベストプラクティス' },
  { id: 'security', number: '7', title: 'セキュリティ・注意点' },
  { id: 'create-your-own', number: '8', title: '自作プラグインへ' },
];

const pluginComponents = [
  {
    icon: '/',
    name: 'Slash Commands',
    desc: 'カスタム /コマンドを追加。/format-docs や /test-api のようなショートカットを定義できます。',
  },
  {
    icon: '🤖',
    name: 'Subagents',
    desc: '「コードレビュー専用」「インフラ設計専用」のような特化エージェントを追加。重い処理を別コンテキストで実行。',
  },
  {
    icon: '⚡',
    name: 'Skills',
    desc: 'Claude が必要だと判断したときだけ自動で呼び出す拡張機能。必要なときだけ Web 検索を実行、など。',
  },
  {
    icon: '🔗',
    name: 'MCP Servers',
    desc: '外部 API やデータソース（Playwright、Jira、社内 API など）をツールとして接続。',
  },
  {
    icon: '🪝',
    name: 'Hooks',
    desc: 'イベントに応じて自動で処理を差し込む。「コミット前にテスト実行」「編集後にコードスタイルチェック」など。',
  },
];

const useCases = [
  {
    icon: '👥',
    title: 'チーム設定の一括共有',
    desc: '.claude-plugin/plugin.json と agents/, commands/, skills/ をまとめて配布。新メンバーが /plugin install 一発で同じ環境を再現できます。',
    items: ['開発環境の標準化', 'オンボーディング時間の短縮', 'チーム間の設定差異を解消'],
  },
  {
    icon: '🏢',
    title: '社内マーケットプレイスで標準化',
    desc: '社内専用のマーケットプレイスを作成し、会社標準のプラグインを配布。',
    items: ['社内コーディング規約レビューエージェント', 'プロダクト固有のデプロイスクリプト', 'Jira や CI/CD と繋がる MCP'],
  },
  {
    icon: '🔍',
    title: 'コード品質・レビュー専用',
    desc: 'コードレビュー専用のエージェントやコマンドをまとめたプラグイン。',
    items: ['agents/code-reviewer.md（シニアレビューア）', 'commands/optimize.md（パフォーマンス検出）', 'セキュリティチェック自動化'],
  },
  {
    icon: '🛠️',
    title: 'DevOps・開発支援',
    desc: 'リポジトリ解析、Web 検索、テスト自動生成などの開発支援ツール。',
    items: ['Repomix でリポジトリ構造分析', 'Web 検索スキルで関連ドキュメント自動取得', 'Playwright でE2Eテスト自動生成'],
  },
];

const bestPractices = [
  {
    icon: '📦',
    title: 'リポジトリ単位でプラグインを固定化',
    desc: 'extraKnownMarketplaces や marketplace.json を使って、特定リポジトリを開いたときに自動で利用候補となるマーケットプレイスを定義。',
  },
  {
    icon: '⚖️',
    title: '役割系プラグインは重ねすぎない',
    desc: '「senior-dev-mode」と「expert-coder」など、役割付与プラグインを複数同時に有効化すると挙動が不安定になることがあります。基本1つまで。',
  },
  {
    icon: '✅',
    title: 'プラグインの検証と CI',
    desc: '/plugin validate で構造チェックを行い、CI に組み込んで plugin.json の破損や参照ファイルの欠落を早期検出。',
  },
  {
    icon: '🔄',
    title: '定期的な棚卸し',
    desc: '月に1回は有効化プラグインを見直す。不要なプラグインは disable してコンテキスト消費を抑える。',
  },
];

export default function PluginHowToPage() {
  return (
    <main className={styles.main}>
      <div className="container">
        <div className={styles.wrapper}>
          <div className={styles.header}>
            <span className={styles.label}>Plugin HowTo</span>
            <h1 className={styles.title}>Claude Code プラグイン完全ガイド</h1>
            <p className={styles.lead}>
              プラグインのインストール・使い方・注意点・ユースケースまとめ
            </p>
          </div>

          {/* Table of Contents */}
          <nav className={styles.toc}>
            <h2 className={styles.tocTitle}>目次</h2>
            <ul className={styles.tocList}>
              {tocItems.map((item) => (
                <li key={item.id} className={styles.tocItem}>
                  <span className={styles.tocNumber}>{item.number}.</span>
                  <a href={`#${item.id}`} className={styles.tocLink}>
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Section 1: What is Plugin */}
          <section id="what-is-plugin" className={styles.section}>
            <h2 className={styles.heading}>
              <span className={styles.sectionNumber}>1</span>
              Claude Code Plugins とは？
            </h2>
            <p className={styles.text}>
              Claude Code プラグインは、<strong>Slash Commands</strong>、<strong>Subagents</strong>、<strong>Skills</strong>、
              <strong>MCP Servers</strong>、<strong>Hooks</strong> などをひとまとめにした「環境パッケージ」です。
            </p>
            <p className={styles.text}>
              「.claude 配下の設定・コマンド・エージェント一式を zip 的に固めて、1 コマンドで配布・共有できるもの」というイメージが近いです。
              もともとの目的は <strong>Claude Code の設定やワークフローを他のメンバーと共有すること</strong> です。
            </p>

            <div className={styles.info}>
              <div className={styles.boxIcon}>💡</div>
              <div>
                <h4 className={styles.boxTitle}>プラグインでできること</h4>
                <p className={styles.boxText}>
                  チーム全員が同じ開発環境・コマンド・エージェントを使えるようになります。
                  新メンバーのオンボーディングや、プロジェクト固有のワークフロー標準化に最適です。
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: Prerequisites */}
          <section id="prerequisites" className={styles.section}>
            <h2 className={styles.heading}>
              <span className={styles.sectionNumber}>2</span>
              前提条件とサポートバージョン
            </h2>
            <p className={styles.text}>
              プラグイン機能は <strong>Claude Code v2.0.12 以降</strong> で正式リリースされています。
              以下のコマンドが追加されています：
            </p>
            <ul className={styles.text} style={{ paddingLeft: '1.5rem' }}>
              <li><code>/plugin install</code> - プラグインのインストール</li>
              <li><code>/plugin enable</code> / <code>/plugin disable</code> - 有効化/無効化</li>
              <li><code>/plugin marketplace</code> - マーケットプレイス管理</li>
              <li><code>/plugin validate</code> - 構造チェック</li>
            </ul>

            <div className={styles.warning}>
              <div className={styles.boxIcon}>⚠️</div>
              <div>
                <h4 className={styles.boxTitle}>注意</h4>
                <p className={styles.boxText}>
                  一部バージョン（例: Windows 上の v2.0.13）では <code>/plugin marketplace</code> を打っても
                  「Unknown slash command: plugin」エラーになる不具合報告があります。
                  その場合は最新版へのアップデートを試してください。
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Using Plugins */}
          <section id="using-plugins" className={styles.section}>
            <h2 className={styles.heading}>
              <span className={styles.sectionNumber}>3</span>
              既存プラグインを使ってみる
            </h2>

            <h3 className={styles.subheading}>3-1. マーケットプレイスを追加</h3>
            <p className={styles.text}>
              プラグインは「マーケットプレイス」というカタログからインストールします。
              まずマーケットプレイスを追加します：
            </p>
            <Terminal
              title="マーケットプレイス追加"
              lines={[
                { type: 'comment', text: 'GitHub リポジトリをマーケットプレイスとして追加' },
                { type: 'command', text: '/plugin marketplace add anthropics/claude-code', prompt: '>' },
                { type: 'output', text: 'Marketplace added: anthropics/claude-code' },
                { type: 'output', text: '' },
                { type: 'comment', text: 'コミュニティのマーケットプレイスも追加可能' },
                { type: 'command', text: '/plugin marketplace add ananddtyagi/claude-code-marketplace', prompt: '>' },
              ]}
            />

            <h3 className={styles.subheading}>3-2. プラグインを探す</h3>
            <p className={styles.text}>
              <code>/plugin</code> を実行すると、インタラクティブなメニューが開きます。
              追加済みマーケットプレイスの一覧と、利用可能なプラグイン一覧を確認できます。
            </p>
            <Terminal
              title="プラグイン一覧を表示"
              lines={[
                { type: 'command', text: '/plugin', prompt: '>' },
                { type: 'output', text: 'Available plugins:' },
                { type: 'output', text: '  - feature-dev@anthropics/claude-code' },
                { type: 'output', text: '  - code-reviewer@my-company' },
                { type: 'output', text: '  - lyra@claude-code-marketplace' },
              ]}
            />

            <h3 className={styles.subheading}>3-3. プラグインをインストール</h3>
            <p className={styles.text}>
              プラグイン名とマーケットプレイス名を指定してインストールします：
            </p>
            <Terminal
              title="プラグインインストール"
              lines={[
                { type: 'command', text: '/plugin install feature-dev@anthropics/claude-code', prompt: '>' },
                { type: 'output', text: 'Installing feature-dev...' },
                { type: 'success', text: 'Installed: feature-dev (1.0.0)' },
                { type: 'output', text: '' },
                { type: 'comment', text: '単一マーケットプレイスの場合は名前だけでOK' },
                { type: 'command', text: '/plugin install lyra', prompt: '>' },
              ]}
            />

            <div className={styles.tip}>
              <div className={styles.boxIcon}>💡</div>
              <div>
                <h4 className={styles.boxTitle}>インストール後は再起動</h4>
                <p className={styles.boxText}>
                  インストール後は Claude Code を再起動して反映することが推奨されています。
                </p>
              </div>
            </div>

            <h3 className={styles.subheading}>3-4. 有効化・無効化・アンインストール</h3>
            <p className={styles.text}>
              <strong>インストール = 常に有効</strong> ではありません。必要なときだけ有効化し、不要になったら無効化してコンテキストを減らしましょう。
            </p>
            <table className={styles.commandTable}>
              <thead>
                <tr>
                  <th>操作</th>
                  <th>コマンド</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>有効化</td>
                  <td><code>/plugin enable plugin-name@marketplace</code></td>
                </tr>
                <tr>
                  <td>無効化</td>
                  <td><code>/plugin disable plugin-name@marketplace</code></td>
                </tr>
                <tr>
                  <td>アンインストール</td>
                  <td><code>/plugin uninstall plugin-name@marketplace</code></td>
                </tr>
                <tr>
                  <td>構造チェック</td>
                  <td><code>/plugin validate plugin-name@marketplace</code></td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* Section 4: What Plugins Add */}
          <section id="what-plugins-add" className={styles.section}>
            <h2 className={styles.heading}>
              <span className={styles.sectionNumber}>4</span>
              プラグインで何が増えるのか
            </h2>
            <p className={styles.text}>
              プラグインを入れると、Claude Code 上で使える機能が増えます。主に以下の5種類です：
            </p>

            <div className={styles.componentGrid}>
              {pluginComponents.map((comp) => (
                <div key={comp.name} className={styles.componentCard}>
                  <div className={styles.componentIcon}>{comp.icon}</div>
                  <h4 className={styles.componentName}>{comp.name}</h4>
                  <p className={styles.componentDesc}>{comp.desc}</p>
                </div>
              ))}
            </div>

            <div className={styles.info}>
              <div className={styles.boxIcon}>📝</div>
              <div>
                <h4 className={styles.boxTitle}>Slash Commands の名前衝突時</h4>
                <p className={styles.boxText}>
                  複数プラグインで同名のコマンドがある場合、<code>/plugin-name:command-name</code> の形式で区別できます。
                  <code>/help</code> からも一覧を確認できます。
                </p>
              </div>
            </div>
          </section>

          {/* Section 5: Use Cases */}
          <section id="use-cases" className={styles.section}>
            <h2 className={styles.heading}>
              <span className={styles.sectionNumber}>5</span>
              実際のユースケース
            </h2>
            <p className={styles.text}>
              プラグインがどのように使われているか、具体的なユースケースを紹介します。
            </p>

            <div className={styles.useCaseGrid}>
              {useCases.map((useCase) => (
                <div key={useCase.title} className={styles.useCaseCard}>
                  <div className={styles.useCaseIcon}>{useCase.icon}</div>
                  <h4 className={styles.useCaseTitle}>{useCase.title}</h4>
                  <p className={styles.useCaseDesc}>{useCase.desc}</p>
                  <ul className={styles.useCaseList}>
                    {useCase.items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Section 6: Best Practices */}
          <section id="best-practices" className={styles.section}>
            <h2 className={styles.heading}>
              <span className={styles.sectionNumber}>6</span>
              チーム運用のベストプラクティス
            </h2>

            <ul className={styles.bestPracticesList}>
              {bestPractices.map((bp) => (
                <li key={bp.title} className={styles.bestPracticeItem}>
                  <div className={styles.bestPracticeIcon}>{bp.icon}</div>
                  <div className={styles.bestPracticeContent}>
                    <h4>{bp.title}</h4>
                    <p>{bp.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Section 7: Security */}
          <section id="security" className={styles.section}>
            <h2 className={styles.heading}>
              <span className={styles.sectionNumber}>7</span>
              セキュリティ・運用上の注意点
            </h2>

            <h3 className={styles.subheading}>悪意あるプラグインのリスク</h3>
            <p className={styles.text}>
              MCP や Hooks は実質「任意の外部サービス呼び出し・スクリプト実行」ができるため、
              以下の点に注意してください：
            </p>
            <ul className={styles.text} style={{ paddingLeft: '1.5rem' }}>
              <li>信頼できるマーケットプレイスのみ追加する</li>
              <li>公開 Marketplace に出す前に <code>/plugin validate</code> + レビューを行う</li>
              <li>社内用はプライベート GitHub / VPN 内リポジトリから配布する</li>
            </ul>

            <h3 className={styles.subheading}>コンテキストとリソース消費</h3>
            <div className={styles.warning}>
              <div className={styles.boxIcon}>⚠️</div>
              <div>
                <h4 className={styles.boxTitle}>プラグイン入れすぎ注意</h4>
                <p className={styles.boxText}>
                  プラグインを入れすぎると、システムプロンプトが肥大化し、モデルのコンテキスト圧迫 → 速度低下やコスト増につながります。
                  <strong>目安: 5個以上有効化するときは挙動を観察</strong>してください。
                </p>
              </div>
            </div>

            <h3 className={styles.subheading}>仕様変更の可能性</h3>
            <p className={styles.text}>
              プラグイン機能は 2025年10月に出たばかりで、公開ベータ → 正式版に切り替わった直後です。
              コマンド名や挙動がマイナーチェンジする可能性があります。
            </p>
          </section>

          {/* Section 8: Create Your Own */}
          <section id="create-your-own" className={styles.section}>
            <h2 className={styles.heading}>
              <span className={styles.sectionNumber}>8</span>
              自作プラグインへの最短ルート
            </h2>
            <p className={styles.text}>
              自分でプラグインを作成する場合、典型的なディレクトリ構成は以下のようになります：
            </p>
            <CodeBlock filename="プラグイン構成例">{`my-marketplace/
├── .claude-plugin/
│   └── marketplace.json      # マーケットプレイス定義
└── my-first-plugin/
    ├── .claude-plugin/
    │   └── plugin.json       # プラグイン定義
    ├── agents/               # エージェント定義
    │   └── code-reviewer.md
    ├── commands/             # スラッシュコマンド
    │   └── optimize.md
    ├── skills/               # スキル定義
    │   └── search.md
    └── hooks/                # フック設定
        └── hooks.json`}</CodeBlock>

            <p className={styles.text}>
              詳細な作成方法は以下のページを参照してください：
            </p>

            <div className={styles.nextSteps}>
              <Link href="/getting-started" className={styles.nextStep}>
                <span className={styles.nextStepIcon}>🚀</span>
                <div>
                  <h4>Getting Started</h4>
                  <p>5分でスキル作成</p>
                </div>
              </Link>
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
            </div>
          </section>

          {/* Footer Note */}
          <p className={styles.footerNote}>
            ※本記事は 2025年11月時点の情報です。最新情報は公式ドキュメントを参照してください。
          </p>
        </div>
      </div>
    </main>
  );
}
