'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './Features.module.css';

const useCases = [
  {
    icon: '🚀',
    title: '1コマンドでスキル作成',
    description: 'new コマンドでスキルのひな形を即生成。Markdown形式で簡単に定義し、すぐにClaude Codeで利用開始。',
    tags: ['簡単', 'CLI'],
    link: '/getting-started',
  },
  {
    icon: '⚡',
    title: 'Guide Plugin で爆速開発',
    description: 'GitHub からインストールするだけで、Claude Code 内でスキル開発のベストプラクティスを即座に参照。開発が爆速に。',
    tags: ['Guide', 'スキル開発'],
    link: '/guide-plugin',
  },
  {
    icon: '📁',
    title: 'プロジェクト組み込み',
    description: '既存プロジェクト内でスキルを開発。コード参照やテストも容易。プロジェクト固有のワークフローをClaude Codeで強化。',
    tags: ['プロジェクト', 'テスト'],
    link: '/getting-started',
  },
  {
    icon: '👥',
    title: 'チームで簡単共有',
    description: 'git pull 後に install . するだけで、チーム全員が同じスキルを即適用。スキルの更新も即反映。',
    tags: ['git', 'チーム'],
    link: '/use-cases#team-sharing',
  },
];

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
          <span className={styles.label}>Features</span>
          <h2 className={styles.title}>こんな使い方ができます</h2>
          <p className={styles.subtitle}>
            スキルを簡単に作成して、すぐに利用開始。
            <br />
            プロジェクト組み込みやチーム共有も、CLIだけで完結します。
          </p>
        </div>

        <div className={styles.grid}>
          {useCases.map((useCase, index) => (
            <Link
              key={index}
              href={useCase.link}
              className={`${styles.card} glass`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={styles.cardHeader}>
                <span className={styles.icon}>{useCase.icon}</span>
                <div className={styles.tags}>
                  {useCase.tags.map((tag) => (
                    <span key={tag} className={styles.tag}>{tag}</span>
                  ))}
                </div>
              </div>
              <h3 className={styles.cardTitle}>{useCase.title}</h3>
              <p className={styles.cardText}>{useCase.description}</p>
              <span className={styles.cardLink}>
                詳しく見る
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          ))}
        </div>

        <div className={styles.cta}>
          <Link href="/use-cases" className={styles.ctaButton}>
            すべてのユースケースを見る
          </Link>
        </div>
      </div>
    </section>
  );
}
