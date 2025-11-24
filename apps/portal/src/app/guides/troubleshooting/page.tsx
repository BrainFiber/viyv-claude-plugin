import styles from './page.module.css';

export default function Troubleshooting() {
    return (
        <div className="container">
            <div className={styles.wrapper}>
                <h1 className={styles.title}>Troubleshooting</h1>
                <p className={styles.lead}>
                    よくあるエラーとその解決方法。
                </p>

                <div className={styles.grid}>
                    <div className={`${styles.card} glass`}>
                        <div className={styles.errorHeader}>
                            <span className={styles.errorIcon}>⚠️</span>
                            <h3>Error: plugin.json not found</h3>
                        </div>
                        <div className={styles.errorBody}>
                            <p className={styles.cause}><strong>原因:</strong> プラグインのルートディレクトリに必要な設定ファイルが見つかりません。</p>
                            <p className={styles.solution}>
                                <strong>解決策:</strong> <code>create</code> コマンドを実行してプラグインを初期化するか、
                                <code>.claude-plugin</code> フォルダが存在することを確認してください。
                            </p>
                        </div>
                    </div>

                    <div className={`${styles.card} glass`}>
                        <div className={styles.errorHeader}>
                            <span className={styles.errorIcon}>🚫</span>
                            <h3>Error: Plugin with ID already exists</h3>
                        </div>
                        <div className={styles.errorBody}>
                            <p className={styles.cause}><strong>原因:</strong> 同じIDを持つプラグインが既に登録されています。</p>
                            <p className={styles.solution}>
                                <strong>解決策:</strong> 別のIDを使用するか、<code>manager.delete(id)</code> で既存のプラグインを削除してから再作成してください。
                            </p>
                        </div>
                    </div>

                    <div className={`${styles.card} glass`}>
                        <div className={styles.errorHeader}>
                            <span className={styles.errorIcon}>🔒</span>
                            <h3>EACCES: permission denied</h3>
                        </div>
                        <div className={styles.errorBody}>
                            <p className={styles.cause}><strong>原因:</strong> ファイルシステムの書き込み権限がありません。</p>
                            <p className={styles.solution}>
                                <strong>解決策:</strong> ディレクトリのパーミッションを確認するか、適切な権限を持つユーザーで実行してください。
                            </p>
                        </div>
                    </div>

                    <div className={`${styles.card} glass`}>
                        <div className={styles.errorHeader}>
                            <span className={styles.errorIcon}>❓</span>
                            <h3>Agent SDK does not recognize plugin</h3>
                        </div>
                        <div className={styles.errorBody}>
                            <p className={styles.cause}><strong>原因:</strong> アダプタを通さずにパスを渡しているか、パスが間違っています。</p>
                            <p className={styles.solution}>
                                <strong>解決策:</strong> 必ず <code>createAgentSdkPluginAdapter</code> を使用し、
                                <code>getSdkPlugins(['id'])</code> で取得したオブジェクトをSDKに渡してください。
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
