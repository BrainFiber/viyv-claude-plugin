'use client';

import { useEffect, useRef } from 'react';
import styles from './Features.module.css';

export default function Features() {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add(styles.visible);
                    }
                });
            },
            { threshold: 0.1 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <section className={styles.features} id="features" ref={sectionRef}>
            <div className="container">
                <div className={styles.header}>
                    <h2 className={styles.title}>Agent SDK に効く機能セット</h2>
                    <p className={styles.subtitle}>
                        ローカルプラグインを作り、IDからパスへ変換し、SDK に即接続するためのツールキット。
                    </p>
                </div>

                <div className={styles.grid}>
                    <div className={`${styles.card} glass`}>
                        <div className={styles.icon}>⚡️</div>
                        <h3 className={styles.cardTitle}>Instant Lifecycle</h3>
                        <p className={styles.cardText}>
                            Create / Update / Import / Delete を API 一発で。
                            `.claude-plugin/plugin.json` も自動生成。
                        </p>
                    </div>

                    <div className={`${styles.card} glass`}>
                        <div className={styles.icon}>🧩</div>
                        <h3 className={styles.cardTitle}>All Components</h3>
                        <p className={styles.cardText}>
                            Commands / Agents / Skills / Hooks / MCP を標準ディレクトリへ配置し、構造を一元管理。
                        </p>
                    </div>

                    <div className={`${styles.card} glass`}>
                        <div className={styles.icon}>🔌</div>
                        <h3 className={styles.cardTitle}>Agent SDK Ready</h3>
                        <p className={styles.cardText}>
                            同梱の adapter が ID を SDK の <code>plugins</code> 形式 <code>{`{ type: 'local', path }`}</code> に変換し、query() にそのまま渡せます。
                        </p>
                    </div>

                    <div className={`${styles.card} glass`}>
                        <div className={styles.icon}>🛡️</div>
                        <h3 className={styles.cardTitle}>Type-Safe & Tested</h3>
                        <p className={styles.cardText}>
                            TypeScript で型安全、カバレッジ 99%+。CI にそのまま乗る信頼性。
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
