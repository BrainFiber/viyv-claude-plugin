'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './Hero.module.css';
import Terminal from './Terminal';

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
      <div className={styles.backgroundGlow} />
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.content}>
            <div className={styles.badge}>
              <span className={styles.badgeDot} />
              Claude Code Plugin Development Kit
            </div>
            <h1 className={styles.title}>
              チーム全員で同じ
              <br />
              <span className={styles.gradientText}>Claude Codeスキルを</span>
            </h1>
            <p className={styles.description}>
              既存プロジェクトに <code>.claude-plugin/</code> と <code>plugins/</code> を作成。
              <br />
              チームメンバーは git pull 後に <code>install .</code> で即適用。
              <br />
              プラグイン開発からチーム展開まで CLI だけで完結。
            </p>
            <div className={styles.actions}>
              <Link href="/getting-started" className={`${styles.button} ${styles.primary}`}>
                5分で始める
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link href="/use-cases" className={`${styles.button} ${styles.secondary}`}>
                ユースケースを見る
              </Link>
            </div>
            <div className={styles.features}>
              <div className={styles.feature}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>リポジトリ内に配置</span>
              </div>
              <div className={styles.feature}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>git pull で共有</span>
              </div>
              <div className={styles.feature}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>Guide Plugin で爆速開発</span>
              </div>
            </div>
          </div>
          <div className={styles.visual}>
            <Terminal
              title="既存プロジェクトでセットアップ"
              lines={[
                { type: 'comment', text: '既存プロジェクトのルートで実行' },
                { type: 'command', text: 'npx viyv-claude-plugin new my-plugin' },
                { type: 'output', text: '' },
                { type: 'output', text: 'Created new plugin scaffold at ./' },
                { type: 'output', text: '  .claude-plugin/marketplace.json' },
                { type: 'output', text: '  plugins/my-plugin/.claude-plugin/plugin.json' },
                { type: 'output', text: '  plugins/my-plugin/skills/sample/SKILL.md' },
                { type: 'output', text: '' },
                { type: 'comment', text: 'Claude Code に登録' },
                { type: 'command', text: 'npx viyv-claude-plugin setup' },
                { type: 'output', text: 'Registered marketplace: my-plugin' },
                { type: 'output', text: '' },
                { type: 'comment', text: 'チームメンバーは pull 後にこれだけ' },
                { type: 'command', text: 'npx viyv-claude-plugin install .' },
                { type: 'output', text: 'Installed: my-plugin' },
              ]}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
