import styles from './page.module.css';

export default function FAQ() {
    return (
        <div className="container">
            <div className={styles.wrapper}>
                <h1 className={styles.title}>FAQ</h1>
                <p className={styles.lead}>
                    Frequently Asked Questions.
                </p>

                <div className={styles.grid}>
                    <div className={`${styles.card} glass`}>
                        <h3>Error: plugin.json not found</h3>
                        <p>
                            This usually happens if the directory structure is incorrect.
                            Run the <code>create</code> command again or check if <code>.claude-plugin</code> folder exists.
                        </p>
                    </div>

                    <div className={`${styles.card} glass`}>
                        <h3>Duplicate ID Error</h3>
                        <p>
                            Plugin IDs must be unique. If you are importing a plugin, ensure its ID doesn't conflict with an existing one.
                            You can rename the plugin in <code>plugin.json</code> before importing.
                        </p>
                    </div>

                    <div className={`${styles.card} glass`}>
                        <h3>How to use with Agent SDK?</h3>
                        <p>
                            Use the <code>createAgentSdkPluginAdapter</code> function.
                            See the <a href="/features">Features</a> page for a diagram and code example.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
