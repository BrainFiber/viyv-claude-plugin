'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './Features.module.css';

const useCases = [
  {
    icon: '👥',
    title: 'チームでスキル共有',
    description: 'プラグインはリポジトリ内に配置。git pull後に install . するだけで、チーム全員が同じスキルを即適用。',
    tags: ['git', 'チーム'],
    link: '/use-cases#team-sharing',
  },
  {
    icon: '📚',
    title: '社内ナレッジBot',
    description: 'FAQや社内ドキュメントを検索するスキルを作成。Claude Codeから直接ナレッジベースにアクセス可能に。',
    tags: ['Skill', 'API連携'],
    link: '/use-cases#knowledge-bot',
  },
  {
    icon: '🔍',
    title: 'コードレビュー支援',
    description: 'エージェントでコード品質チェックを自動化。セキュリティ・パフォーマンス・保守性を一括レビュー。',
    tags: ['Agent', '品質管理'],
    link: '/use-cases#code-review',
  },
  {
    icon: '🔗',
    title: 'API連携スキル',
    description: '外部サービス（Slack、Notion、GitHub等）をClaude Codeから操作。MCPサーバーで高度な連携も。',
    tags: ['Skill', 'MCP'],
    link: '/use-cases#api-integration',
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
          <span className={styles.label}>Use Cases</span>
          <h2 className={styles.title}>チームで活用する</h2>
          <p className={styles.subtitle}>
            リポジトリ内にプラグインを配置して、チーム全員で同じスキルを共有。
            <br />
            プロジェクト固有のワークフローを Claude Code で強化します。
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
