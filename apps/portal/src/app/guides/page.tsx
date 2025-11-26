import CodeBlock from '@/components/CodeBlock';
import styles from './page.module.css';

export default function Guides() {
    return (
        <div className="container">
            <div className={styles.wrapper}>
                <h1 className={styles.title}>Guides</h1>
                <p className={styles.lead}>
                    viyv-claude-plugin を使いこなすためのステップバイステップガイド。
                </p>

                <section className={styles.section}>
                    <h2 className={styles.heading}>フルワークフロー</h2>
                    <p className={styles.text}>
                        プラグインの作成、更新、インポート、削除を行う完全なライフサイクル例です。
                    </p>

                    <div className={styles.workflowSteps}>
                        <div className={styles.step}>
                            <div className={styles.stepNumber}>1</div>
                            <h3>Create</h3>
                            <p>メタデータとスキルを指定して新規プラグインを初期化。</p>
                        </div>
                        <div className={styles.stepLine}></div>
                        <div className={styles.step}>
                            <div className={styles.stepNumber}>2</div>
                            <h3>Update</h3>
                            <p>説明文の変更やスキルの追加・更新。</p>
                        </div>
                        <div className={styles.stepLine}></div>
                        <div className={styles.step}>
                            <div className={styles.stepNumber}>3</div>
                            <h3>Import</h3>
                            <p>既存のパスやURLからプラグインを取り込み。</p>
                        </div>
                        <div className={styles.stepLine}></div>
                        <div className={styles.step}>
                            <div className={styles.stepNumber}>4</div>
                            <h3>Delete</h3>
                            <p>不要になったプラグインを安全に削除。</p>
                        </div>
                    </div>

                    <CodeBlock
                        filename="workflow-demo.ts"
                        code={`import { createPluginManager } from 'viyv-claude-plugin-core';

const manager = await createPluginManager();

// 1. 作成 (Create)
const plugin = await manager.create({
    name: 'demo-plugin',
    skills: [{ id: 'test', content: 'Test skill' }]
});

// 2. 更新 (Update)
await manager.update(plugin.id, {
    description: 'Updated description'
});

// 3. インポート (Import from path)
await manager.importFromPath({
    path: '/path/to/another/plugin'
});

// 4. 削除 (Delete)
await manager.delete(plugin.id); `}
                        language="typescript"
                    />
                </section>

                <section className={styles.section}>
                    <h2 className={styles.heading}>トラブルシューティング</h2>
                    <div className={styles.troubleshootGrid}>
                        <div className={`${styles.card} glass`}>
                            <h3>Missing plugin.json</h3>
                            <p className={styles.errorMsg}>Error: plugin.json not found</p>
                            <p className={styles.solution}>
                                ディレクトリ構造が正しいか確認してください。<code>.claude-plugin</code> フォルダが必須です。
                            </p>
                        </div>
                        <div className={`${styles.card} glass`}>
                            <h3>Duplicate ID</h3>
                            <p className={styles.errorMsg}>Error: Plugin with ID already exists</p>
                            <p className={styles.solution}>
                                IDは一意である必要があります。別の名前を使うか、既存のプラグインを削除してください。
                            </p>
                        </div>
                        <div className={`${styles.card} glass`}>
                            <h3>Permission Denied</h3>
                            <p className={styles.errorMsg}>EACCES: permission denied</p>
                            <p className={styles.solution}>
                                ファイルの権限を確認するか、適切なアクセス権限で実行してください。
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
