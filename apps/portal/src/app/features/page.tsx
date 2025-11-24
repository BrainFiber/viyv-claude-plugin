import styles from './page.module.css';

export default function Features() {
    return (
        <div className="container">
            <div className={styles.wrapper}>
                <h1 className={styles.title}>Features</h1>
                <p className={styles.lead}>
                    Agent SDK で使うためのローカルプラグインを、構造から連携までフルサポート。
                </p>

                <section className={styles.section}>
                    <h2 className={styles.heading}>Plugin Lifecycle</h2>
                    <p className={styles.text}>
                        Create / Update / Import / Delete を API で完結。`.claude-plugin/plugin.json` も自動生成。
                    </p>

                    <div className={styles.lifecycleContainer}>
                        <div className={styles.lifecycleStep}>
                            <div className={styles.stepIcon}>✨</div>
                            <div className={styles.stepLabel}>Create</div>
                        </div>
                        <div className={styles.arrow}>→</div>
                        <div className={styles.lifecycleStep}>
                            <div className={styles.stepIcon}>🔄</div>
                            <div className={styles.stepLabel}>Update</div>
                        </div>
                        <div className={styles.arrow}>→</div>
                        <div className={styles.lifecycleStep}>
                            <div className={styles.stepIcon}>📥</div>
                            <div className={styles.stepLabel}>Import (path/URL)</div>
                        </div>
                        <div className={styles.arrow}>→</div>
                        <div className={styles.lifecycleStep}>
                            <div className={styles.stepIcon}>🗑️</div>
                            <div className={styles.stepLabel}>Delete</div>
                        </div>
                    </div>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.heading}>Component Architecture</h2>
                    <div className={styles.grid}>
                        <div className={`${styles.card} glass`}>
                            <h3>Commands</h3>
                            <p>Slash コマンド定義。SDK でユーザー操作に応答。</p>
                            <code className={styles.path}>commands/*.md</code>
                        </div>
                        <div className={`${styles.card} glass`}>
                            <h3>Agents</h3>
                            <p>特化エージェントを Markdown で定義。SDK が自動発見。</p>
                            <code className={styles.path}>agents/*.md</code>
                        </div>
                        <div className={`${styles.card} glass`}>
                            <h3>Skills</h3>
                            <p>model-invoked Skill。`settingSources` でロード。</p>
                            <code className={styles.path}>skills/&lt;id&gt;/SKILL.md</code>
                        </div>
                        <div className={`${styles.card} glass`}>
                            <h3>Hooks</h3>
                            <p>イベントに反応するハンドラ設定。</p>
                            <code className={styles.path}>hooks/hooks.json</code>
                        </div>
                        <div className={`${styles.card} glass`}>
                            <h3>MCP Servers</h3>
                            <p>外部ツール連携を MCP で追加。</p>
                            <code className={styles.path}>.mcp.json</code>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
