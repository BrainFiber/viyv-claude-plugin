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
              Claude Codeスキルを
              <br />
              <span className={styles.gradientText}>簡単に作成・即利用</span>
            </h1>
            <p className={styles.description}>
              1コマンドでスキル作成、すぐに利用開始。
              <br />
              単独でもプロジェクト内でも開発可能。チーム共有も簡単。
            </p>
            <div className={styles.installCommand}>
              <code>npx viyv-claude-plugin new my-plugin</code>
            </div>
            <div className={styles.actions}>
              <Link href="/getting-started" className={`${styles.button} ${styles.primary}`}>
                5分で始める
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link href="/plugin-howto" className={`${styles.button} ${styles.secondary}`}>
                Plugin HowTo
              </Link>
              <Link href="/guide-plugin" className={`${styles.button} ${styles.secondary}`}>
                Guide Plugin
              </Link>
            </div>
            <div className={styles.features}>
              <div className={styles.feature}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>1コマンドで作成</span>
              </div>
              <div className={styles.feature}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>単独/プロジェクト内対応</span>
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
              title="スキルを作成してすぐに利用"
              lines={[
                { type: 'comment', text: '初回: Guide Plugin をインストール + セットアップ' },
                { type: 'command', text: 'npx viyv-claude-plugin install https://github.com/BrainFiber/viyv-claude-plugin' },
                { type: 'output', text: 'Installed: viyv-claude-plugin-guide' },
                { type: 'command', text: 'npx viyv-claude-plugin setup' },
                { type: 'output', text: 'Registered marketplace: local-marketplace' },
                { type: 'output', text: '' },
                { type: 'comment', text: 'プラグイン作成' },
                { type: 'command', text: 'npx viyv-claude-plugin new my-plugin' },
                { type: 'output', text: 'Created: plugins/my-plugin/' },
                { type: 'output', text: '' },
                { type: 'comment', text: 'スキルを編集して install' },
                { type: 'command', text: 'npx viyv-claude-plugin install .' },
                { type: 'output', text: 'Installed: my-plugin' },
                { type: 'output', text: '' },
                { type: 'success', text: 'Claude Code でアクティベートして利用開始!' },
              ]}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
