import Terminal from '@/components/Terminal';
import styles from './page.module.css';

const commands = [
  {
    name: 'new',
    usage: 'npx viyv-claude-plugin new <name>',
    description: '新規プラグインプロジェクトを作成します。マーケットプレイスとプラグインの雛形が生成されます。',
    options: [
      { flag: '--dir <path>', desc: '作成先ディレクトリ' },
      { flag: '--description <text>', desc: 'プラグインの説明' },
      { flag: '--version <ver>', desc: 'バージョン（デフォルト: 0.0.1）' },
      { flag: '--force', desc: '既存ファイルを上書き' },
    ],
  },
  {
    name: 'setup',
    usage: 'npx viyv-claude-plugin setup',
    description: '初回のみ実行。ローカルマーケットプレイス（~/.viyv-claude）をClaude Codeに登録します。',
    options: [
      { flag: '-p, --path <path>', desc: 'マーケットプレイスのパス' },
      { flag: '-n, --name <name>', desc: 'マーケットプレイス名' },
      { flag: '--dry-run', desc: '実行内容を表示のみ' },
    ],
  },
  {
    name: 'update',
    usage: 'npx viyv-claude-plugin update [path]',
    description: 'マーケットプレイスの変更をClaude Codeに反映します。開発中に変更を加えた後に実行してください。',
    options: [
      { flag: '-n, --name <name>', desc: 'マーケットプレイス名' },
      { flag: '--dry-run', desc: '実行内容を表示のみ' },
    ],
  },
  {
    name: 'install',
    usage: 'npx viyv-claude-plugin install <source> [name...]',
    description: '様々なソースからプラグインをインストールします。',
    options: [
      { flag: '--all', desc: 'マーケットプレイスの全プラグインをインストール' },
      { flag: '--ref <ref>', desc: 'Git ブランチ/タグ/コミット' },
      { flag: '--force', desc: '既存プラグインを上書き' },
      { flag: '--dry-run', desc: '実行内容を表示のみ' },
    ],
  },
  {
    name: 'list',
    usage: 'npx viyv-claude-plugin list',
    description: 'インストール済みのプラグイン一覧を表示します。',
    options: [],
  },
  {
    name: 'remove',
    usage: 'npx viyv-claude-plugin remove <id>',
    description: 'インストール済みのプラグインを削除します。',
    options: [
      { flag: '--dry-run', desc: '実行内容を表示のみ' },
    ],
  },
  {
    name: 'update-plugin',
    usage: 'npx viyv-claude-plugin update-plugin <id>',
    description: 'プラグインを元のソースから再インストールして更新します。',
    options: [
      { flag: '--source <source>', desc: '新しいソースを指定' },
      { flag: '--ref <ref>', desc: 'Git ブランチ/タグ/コミット' },
    ],
  },
];

const sources = [
  { type: 'ローカルディレクトリ', example: './path/to/plugin' },
  { type: 'ZIPファイル', example: './plugin.zip' },
  { type: 'GitHub (HTTPS)', example: 'https://github.com/user/repo' },
  { type: 'GitHub (短縮形)', example: 'github:user/repo' },
  { type: 'Git URL', example: 'git@github.com:user/repo.git' },
];

export default function CLIPage() {
  return (
    <main className={styles.main}>
      <div className="container">
        <div className={styles.header}>
          <span className={styles.label}>CLI Reference</span>
          <h1 className={styles.title}>コマンドライン リファレンス</h1>
          <p className={styles.subtitle}>
            viyv-claude-plugin CLI の全コマンドとオプションの詳細リファレンス
          </p>
        </div>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>インストール</h2>
          <div className={styles.installBox}>
            <Terminal
              title="Installation"
              lines={[
                { type: 'comment', text: 'npx で直接実行（推奨）' },
                { type: 'command', text: 'npx viyv-claude-plugin <command>' },
                { type: 'output', text: '' },
                { type: 'comment', text: 'またはグローバルインストール' },
                { type: 'command', text: 'npm install -g viyv-claude-plugin' },
              ]}
            />
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>コマンド一覧</h2>
          <div className={styles.commands}>
            {commands.map((cmd) => (
              <div key={cmd.name} className={styles.command} id={cmd.name}>
                <div className={styles.commandHeader}>
                  <h3 className={styles.commandName}>{cmd.name}</h3>
                  <code className={styles.commandUsage}>{cmd.usage}</code>
                </div>
                <p className={styles.commandDesc}>{cmd.description}</p>
                {cmd.options.length > 0 && (
                  <div className={styles.options}>
                    <h4 className={styles.optionsTitle}>オプション</h4>
                    <table className={styles.optionsTable}>
                      <tbody>
                        {cmd.options.map((opt) => (
                          <tr key={opt.flag}>
                            <td><code>{opt.flag}</code></td>
                            <td>{opt.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>インストールソースタイプ</h2>
          <p className={styles.sectionDesc}>
            <code>install</code> コマンドは以下のソースタイプをサポートしています：
          </p>
          <table className={styles.sourcesTable}>
            <thead>
              <tr>
                <th>タイプ</th>
                <th>例</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((src) => (
                <tr key={src.type}>
                  <td>{src.type}</td>
                  <td><code>{src.example}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>使用例</h2>
          <div className={styles.examples}>
            <div className={styles.example}>
              <h4>初回セットアップからプラグイン作成まで</h4>
              <Terminal
                title="Quick Start"
                lines={[
                  { type: 'comment', text: '初回のみ: マーケットプレイスをセットアップ' },
                  { type: 'command', text: 'npx viyv-claude-plugin setup' },
                  { type: 'output', text: '' },
                  { type: 'comment', text: 'プラグイン作成' },
                  { type: 'command', text: 'npx viyv-claude-plugin new my-plugin' },
                  { type: 'comment', text: 'スキルを編集後、インストール' },
                  { type: 'command', text: 'npx viyv-claude-plugin install .' },
                ]}
              />
            </div>
            <div className={styles.example}>
              <h4>GitHubからプラグインをインストール</h4>
              <Terminal
                title="Install from GitHub"
                lines={[
                  { type: 'command', text: 'npx viyv-claude-plugin install github:user/repo' },
                  { type: 'output', text: 'Installed plugin: my-plugin (1.0.0)' },
                  { type: 'output', text: '' },
                  { type: 'comment', text: '特定のブランチから' },
                  { type: 'command', text: 'npx viyv-claude-plugin install github:user/repo --ref develop' },
                ]}
              />
            </div>
            <div className={styles.example}>
              <h4>マーケットプレイスから全プラグインをインストール</h4>
              <Terminal
                title="Install All"
                lines={[
                  { type: 'command', text: 'npx viyv-claude-plugin install ./marketplace --all' },
                  { type: 'output', text: 'Installed plugin: plugin-a (1.0.0)' },
                  { type: 'output', text: 'Installed plugin: plugin-b (1.0.0)' },
                  { type: 'output', text: 'Installed plugin: plugin-c (1.0.0)' },
                ]}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
