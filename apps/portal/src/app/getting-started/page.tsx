import CodeBlock from '@/components/CodeBlock';
import styles from './page.module.css';

export default function GettingStarted() {
    return (
        <div className="container">
            <div className={styles.wrapper}>
                <h1 className={styles.title}>Getting Started</h1>
                <p className={styles.lead}>
                    5分以内に Claude プラグイン開発を始めましょう。
                </p>

                <section className={styles.section}>
                    <h2 className={styles.heading}>1. インストール</h2>
                    <p className={styles.text}>
                        パッケージをインストールし、コアライブラリをビルドします。
                    </p>
                    <CodeBlock
                        code={`pnpm install
pnpm --filter @viyv-claude-plugin build`}
                        language="bash"
                    />
                </section>

                <section className={styles.section}>
                    <h2 className={styles.heading}>2. クイックスタート</h2>
                    <p className={styles.text}>
                        シンプルなプラグインを作成し、一覧表示し、削除するまでの流れです。
                    </p>
                    <CodeBlock
                        filename="quickstart.ts"
                        code={`import { createPluginManager } from '@viyv-claude-plugin';

const manager = await createPluginManager();

// 1. 作成 (Create)
const plugin = await manager.create({
  name: 'my-first-plugin',
  description: 'A demo plugin',
  skills: [{ id: 'hello', content: 'Hello World skill' }]
});
console.log('Created:', plugin.id);

// 2. 一覧 (List)
const list = await manager.list();
console.log('Plugins:', list.map(p => p.id));

// 3. 削除 (Delete)
await manager.delete(plugin.id);
console.log('Deleted:', plugin.id);`}
                        language="typescript"
                    />

                    <div className={`${styles.checklist} glass`}>
                        <h3 className={styles.checklistTitle}>動作確認チェックリスト</h3>
                        <ul className={styles.checkListItems}>
                            <li className={styles.checkItem}>
                                <span className={styles.checkIcon}>✅</span>
                                <span>プラグイン作成</span>
                            </li>
                            <li className={styles.checkItem}>
                                <span className={styles.checkIcon}>✅</span>
                                <span>一覧取得</span>
                            </li>
                            <li className={styles.checkItem}>
                                <span className={styles.checkIcon}>✅</span>
                                <span>プラグイン削除</span>
                            </li>
                        </ul>
                    </div>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.heading}>3. 設定とパスの優先順位</h2>
                    <p className={styles.text}>
                        ライブラリは以下の順序でプラグインのルートディレクトリを解決します：
                    </p>

                    <div className={styles.timeline}>
                        <div className={styles.timelineItem}>
                            <div className={styles.timelineMarker}>1</div>
                            <div className={styles.timelineContent}>
                                <h4 className={styles.timelineTitle}>CLAUDE_PLUGIN_ROOT</h4>
                                <p className={styles.timelineDesc}>環境変数 (最高優先度)</p>
                            </div>
                        </div>
                        <div className={styles.timelineItem}>
                            <div className={styles.timelineMarker}>2</div>
                            <div className={styles.timelineContent}>
                                <h4 className={styles.timelineTitle}>config.json</h4>
                                <p className={styles.timelineDesc}><code>~/.viyv-claude/config.json</code> の <code>pluginRoot</code></p>
                            </div>
                        </div>
                        <div className={styles.timelineItem}>
                            <div className={styles.timelineMarker}>3</div>
                            <div className={styles.timelineContent}>
                                <h4 className={styles.timelineTitle}>デフォルトパス</h4>
                                <p className={styles.timelineDesc}><code>~/.viyv-claude/plugins</code> (フォールバック)</p>
                            </div>
                        </div>
                    </div>

                    <div className={styles.configExample}>
                        <h3 className={styles.subheading}>設定ファイル例</h3>
                        <CodeBlock
                            filename="~/.viyv-claude/config.json"
                            code={`{
  "pluginRoot": "/Users/username/my-custom-plugins"
}`}
                            language="json"
                        />
                    </div>
                </section>
            </div>
        </div>
    );
}
