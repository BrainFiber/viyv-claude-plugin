import Image from 'next/image';
import styles from './page.module.css';

export default function About() {
    return (
        <div className="container">
            <div className={styles.wrapper}>
                <h1 className={styles.title}>About viyv-claude-plugin</h1>
                <p className={styles.lead}>
                    Claude Agent SDK でローカルプラグインを安全に扱うための基盤ライブラリです。
                </p>

                <div className={styles.grid}>
                    <div className={styles.content}>
                        <h2 className={styles.heading}>What is it?</h2>
                        <p className={styles.text}>
                            <strong>viyv-claude-plugin</strong> は、Claude Agent SDK 用のプラグイン資産を ID ベースで管理し、標準構造に従って自動生成する Node.js ライブラリです。
                        </p>
                        <p className={styles.text}>
                            ファイル構造と JSON 設定の複雑さを隠蔽し、commands / agents / skills / hooks / MCP を一括で扱えます。
                        </p>

                        <h2 className={styles.heading}>Why use it?</h2>
                        <ul className={styles.list}>
                            <li className={styles.listItem}>
                                <strong>構造の自動生成:</strong> <code>plugin.json</code> もディレクトリ構造も自動で用意。
                            </li>
                            <li className={styles.listItem}>
                                <strong>Type Safety:</strong> TypeScript で型安全。設定ミスを早期に防止。
                            </li>
                            <li className={styles.listItem}>
                                <strong>Agent SDK 直結:</strong> 同梱 adapter が ID を SDK 用の <code>{`{type:'local', path}`}</code> へ変換し、そのまま query() に渡せます。
                            </li>
                        </ul>
                    </div>

                    <div className={styles.visual}>
                        <div className={`${styles.diagram} glass`}>
                            <Image
                                src="/images/architecture.png"
                                alt="Architecture Diagram"
                                width={500}
                                height={400}
                                className={styles.archImage}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
