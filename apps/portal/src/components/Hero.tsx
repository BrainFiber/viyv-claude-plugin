'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Hero.module.css';

export default function Hero() {
    const heroRef = useRef<HTMLElement>(null);

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

        if (heroRef.current) {
            observer.observe(heroRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <section className={`${styles.hero} ${styles.fadeIn}`} ref={heroRef}>
            <div className="container">
                <div className={styles.grid}>
                    <div className={styles.content}>
                        <div className={styles.badge}>
                            <span className={styles.badgeDot}></span>
                            Agent SDK Ready · v1.0.0
                        </div>
                        <h1 className={styles.title}>
                            Claude Agent SDK の <br />
                            プラグイン基盤を<span className={styles.gradientText}>最速で構築</span>
                        </h1>
                        <p className={styles.description}>
                            コマンド・エージェント・スキル・フック・MCP を一括生成。
                            ID をパスに変換するアダプタで Agent SDK へそのまま渡せます。
                            型安全 & 高カバレッジでプロダクションに安心。
                        </p>
                        <div className={styles.actions}>
                            <Link href="/getting-started" className={`${styles.button} ${styles.primary}`}>
                                5分でセットアップ
                            </Link>
                            <Link href="/features" className={`${styles.button} ${styles.secondary}`}>
                                機能を見る
                            </Link>
                        </div>
                        <div className={styles.stats}>
                            <div className={styles.stat}>
                                <span className={styles.statValue}>99%+</span>
                                <span className={styles.statLabel}>Test Coverage</span>
                            </div>
                            <div className={styles.stat}>
                                <span className={styles.statValue}>Adapter in-box</span>
                                <span className={styles.statLabel}>Agent SDK に即接続</span>
                            </div>
                        </div>
                    </div>
                    <div className={styles.visual}>
                        <div className={`${styles.card} glass`}>
                            <Image
                                src="/images/hero-visual.png"
                                alt="Plugin Architecture"
                                width={600}
                                height={400}
                                className={styles.heroImage}
                                priority
                            />
                            <div className={styles.codeOverlay}>
                                <pre className={styles.code}>
                                    <code>
                                        <span className={styles.keyword}>const</span> <span className={styles.variable}>manager</span> = <span className={styles.keyword}>await</span> <span className={styles.function}>createPluginManager</span>();{'\n'}
                                        {'\n'}
                                        <span className={styles.comment}>// Create a new plugin</span>{'\n'}
                                        <span className={styles.keyword}>await</span> <span className={styles.variable}>manager</span>.<span className={styles.function}>create</span>({'{'}{'\n'}
                                        {'  '}name: <span className={styles.string}>'my-plugin'</span>,{'\n'}
                                        {'  '}skills: [{'{'} id: <span className={styles.string}>'search'</span> {'}'}],{'\n'}
                                        {'  '}commands: [{'{'} id: <span className={styles.string}>'hello'</span>, content: '# Hello' {'}'}]{'\n'}
                                        {'}'});{'\n'}
                                        {'\n'}
                                        <span className={styles.comment}>// Pass to Agent SDK</span>{'\n'}
                                        <span className={styles.keyword}>const</span> <span className={styles.variable}>plugins</span> = <span className={styles.keyword}>await</span> <span className={styles.function}>createAgentSdkPluginAdapter</span>(<span className={styles.variable}>manager</span>).<span className={styles.function}>getSdkPlugins</span>([<span className={styles.string}>'my-plugin'</span>]);
                                    </code>
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
