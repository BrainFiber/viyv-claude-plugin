import CodeBlock from '@/components/CodeBlock';
import Terminal from '@/components/Terminal';
import styles from './page.module.css';

export default function AgentSdkPage() {
  return (
    <main className={styles.main}>
      <div className="container">
        <div className={styles.header}>
          <span className={styles.label}>Core Library</span>
          <h1 className={styles.title}>Claude Agent SDK 連携を圧倒的に簡単に</h1>
          <p className={styles.subtitle}>
            viyv-claude-plugin-core を使えば、従来のファイルシステム手動管理から解放され、
            プログラマティックにプラグインを作成・管理できます。
          </p>
        </div>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>従来の課題</h2>
          <div className={styles.comparison}>
            <div className={styles.before}>
              <h3 className={styles.comparisonTitle}>
                <span className={styles.beforeBadge}>Before</span>
                手動でファイル配置
              </h3>
              <ul className={styles.problemList}>
                <li>プラグインを特定のディレクトリに手動配置</li>
                <li>plugin.json を正しい形式で手書き</li>
                <li>ファイル構造を覚える必要がある</li>
                <li>パス解決を自分で実装</li>
                <li>環境ごとに設定が異なる</li>
              </ul>
            </div>
            <div className={styles.after}>
              <h3 className={styles.comparisonTitle}>
                <span className={styles.afterBadge}>After</span>
                Core パッケージで自動管理
              </h3>
              <ul className={styles.solutionList}>
                <li>API でプラグインを作成するだけ</li>
                <li>plugin.json は自動生成</li>
                <li>ファイル構造は Core が管理</li>
                <li>パス解決は自動</li>
                <li>設定は環境変数で統一</li>
              </ul>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>インストール</h2>
          <Terminal
            title="Install Core Package"
            lines={[
              { type: 'command', text: 'npm install viyv-claude-plugin-core' },
              { type: 'comment', text: 'または' },
              { type: 'command', text: 'pnpm add viyv-claude-plugin-core' },
            ]}
          />
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>基本的な使い方</h2>
          <p className={styles.sectionDesc}>
            <code>createPluginManager</code> でマネージャーを作成し、
            プラグインの CRUD 操作を行います。
          </p>
          <CodeBlock filename="basic-usage.ts">{`import { createPluginManager } from 'viyv-claude-plugin-core';

// マネージャーを作成
const manager = await createPluginManager();

// プラグインを作成
const plugin = await manager.create({
  name: 'my-assistant',
  description: 'Custom assistant plugin',
  skills: [{
    id: 'greet',
    content: \`---
name: greet
description: Provides greeting messages. Auto-invoke when user mentions: hello, hi, greet.
---
# Greeting Skill

Say hello to the user in a friendly manner.
\`
  }]
});

// 一覧取得
const plugins = await manager.list();

// 更新
await manager.update(plugin.id, {
  version: '1.1.0',
  skills: [/* updated skills */]
});

// 削除
await manager.delete(plugin.id);`}</CodeBlock>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Agent SDK との統合</h2>
          <p className={styles.sectionDesc}>
            <code>createAgentSdkPluginAdapter</code> を使うと、
            作成したプラグインを Claude Agent SDK に直接渡せる形式に変換できます。
          </p>
          <CodeBlock filename="agent-sdk-integration.ts">{`import { createPluginManager, createAgentSdkPluginAdapter } from 'viyv-claude-plugin-core';
import { query } from '@anthropic-ai/claude-agent-sdk';

// マネージャーとアダプタを作成
const manager = await createPluginManager();
const adapter = createAgentSdkPluginAdapter(manager);

// プラグインを作成（上記と同じ）
const plugin = await manager.create({
  name: 'calculator',
  description: 'Math operations',
  skills: [{ id: 'add', content: '# Add\\nAdd two numbers.' }]
});

// SDK 用のプラグイン参照を取得
const sdkPlugins = await adapter.getSdkPlugins(['calculator']);
// => [{ path: '/Users/.../plugins/calculator' }]

// Agent SDK で使用
for await (const message of query({
  prompt: 'What is 2 + 3?',
  options: {
    model: 'claude-sonnet-4-20250514',
    plugins: sdkPlugins
  }
})) {
  console.log(message);
}`}</CodeBlock>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>API リファレンス</h2>

          <div className={styles.apiSection}>
            <h3 className={styles.apiName}>createPluginManager(options?)</h3>
            <p className={styles.apiDesc}>プラグインマネージャーを作成します。</p>
            <CodeBlock>{`const manager = await createPluginManager({
  pluginRoot: '/custom/path' // オプション: カスタムルートパス
});`}</CodeBlock>
          </div>

          <div className={styles.apiSection}>
            <h3 className={styles.apiName}>createAgentSdkPluginAdapter(manager)</h3>
            <p className={styles.apiDesc}>Agent SDK 用のアダプタを作成します。</p>
            <CodeBlock>{`const adapter = createAgentSdkPluginAdapter(manager);

// プラグインIDの配列を渡してSDK用参照を取得
const plugins = await adapter.getSdkPlugins(['plugin-a', 'plugin-b']);
// => [{ path: '...' }, { path: '...' }]`}</CodeBlock>
          </div>

          <div className={styles.apiSection}>
            <h3 className={styles.apiName}>ClaudePluginManager</h3>
            <p className={styles.apiDesc}>プラグイン管理の主要インターフェース。</p>
            <table className={styles.methodsTable}>
              <thead>
                <tr>
                  <th>メソッド</th>
                  <th>説明</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>create(input)</code></td>
                  <td>新規プラグインを作成</td>
                </tr>
                <tr>
                  <td><code>get(id)</code></td>
                  <td>IDでプラグインを取得</td>
                </tr>
                <tr>
                  <td><code>list(filter?)</code></td>
                  <td>プラグイン一覧を取得</td>
                </tr>
                <tr>
                  <td><code>update(id, input)</code></td>
                  <td>プラグインを更新</td>
                </tr>
                <tr>
                  <td><code>delete(id)</code></td>
                  <td>プラグインを削除</td>
                </tr>
                <tr>
                  <td><code>importFromPath(opts)</code></td>
                  <td>ローカルパスからインポート</td>
                </tr>
                <tr>
                  <td><code>importFromUrl(opts)</code></td>
                  <td>URLからインポート</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>設定</h2>
          <p className={styles.sectionDesc}>
            プラグインの保存先は以下の優先順位で決定されます。
          </p>
          <div className={styles.configList}>
            <div className={styles.configItem}>
              <span className={styles.configPriority}>1</span>
              <div>
                <h4>環境変数</h4>
                <code>CLAUDE_PLUGIN_ROOT=/custom/path</code>
              </div>
            </div>
            <div className={styles.configItem}>
              <span className={styles.configPriority}>2</span>
              <div>
                <h4>設定ファイル</h4>
                <code>~/.viyv-claude/config.json</code>
              </div>
            </div>
            <div className={styles.configItem}>
              <span className={styles.configPriority}>3</span>
              <div>
                <h4>デフォルト</h4>
                <code>~/.viyv-claude/plugins/</code>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
