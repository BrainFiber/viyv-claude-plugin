import CodeBlock from '@/components/CodeBlock';
import styles from './page.module.css';

export default function Examples() {
    return (
        <div className="container">
            <div className={styles.wrapper}>
                <h1 className={styles.title}>Examples</h1>
                <p className={styles.lead}>
                    すぐに使える実践的な使用例。
                </p>

                <section className={styles.section}>
                    <h2 className={styles.heading}>基本の使い方</h2>
                    <p className={styles.text}>
                        プラグインの作成、一覧表示、削除を行う最小限の例です。
                        <code>examples/basic-usage</code> にあります。
                    </p>
                    <CodeBlock
                        code={`pnpm --filter basic-usage-example start`}
                        language="bash"
                    />
                </section>

                <section className={styles.section}>
                    <h2 className={styles.heading}>フルカバレッジ</h2>
                    <p className={styles.text}>
                        Commands, Agents, Skills, Hooks, MCP Servers の全コンポーネントを網羅した包括的なデモです。
                        <code>examples/full-coverage</code> にあります。
                    </p>
                    <CodeBlock
                        code={`pnpm --filter full-coverage-example start`}
                        language="bash"
                    />
                    <p className={styles.note}>
                        Note: 問題が発生した場合は、tsx で直接実行してみてください:
                        <br />
                        <code>node --loader tsx full-demo.ts</code>
                    </p>
                </section>
            </div>
        </div>
    );
}
