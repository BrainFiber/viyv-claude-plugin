'use client';

import { useEffect, useRef } from 'react';
import styles from './Steps.module.css';

const steps = [
  {
    number: '01',
    title: 'セットアップ',
    command: 'npx viyv-claude-plugin setup',
    description: '初回のみ実行。ローカルマーケットプレイスをClaude Codeに登録します。',
    badge: '初回のみ',
  },
  {
    number: '02',
    title: 'プラグイン作成',
    command: 'npx viyv-claude-plugin new my-plugin',
    description: 'プラグインのひな形を作成。単独でもプロジェクト内でもOK。',
  },
  {
    number: '03',
    title: 'インストール',
    command: 'npx viyv-claude-plugin install .',
    description: 'スキルを編集後、インストールして利用可能に。',
  },
  {
    number: '04',
    title: 'アクティベート',
    command: 'Claude Code → Plugin → 選択',
    description: 'Claude Codeでスキルをアクティベートして利用開始。',
  },
];

export default function Steps() {
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
    <section className={styles.steps} ref={sectionRef}>
      <div className="container">
        <div className={styles.header}>
          <span className={styles.label}>How It Works</span>
          <h2 className={styles.title}>4ステップで利用開始</h2>
          <p className={styles.subtitle}>
            セットアップから利用開始まで、わずか数分で完了
          </p>
        </div>

        <div className={styles.grid}>
          {steps.map((step, index) => (
            <div
              key={index}
              className={styles.step}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className={styles.stepNumber}>{step.number}</div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <div className={styles.command}>
                <code>{step.command}</code>
              </div>
              <p className={styles.stepDescription}>{step.description}</p>
              {index < steps.length - 1 && (
                <div className={styles.connector}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={styles.fileStructure}>
          <h3 className={styles.fileStructureTitle}>生成されるファイル構造</h3>
          <div className={styles.fileTree}>
            <pre>{`your-project/
├── .claude-plugin/
│   └── marketplace.json   ← マーケットプレイス定義
├── plugins/
│   └── my-plugin/         ← プラグイン本体
│       ├── .claude-plugin/plugin.json
│       ├── skills/
│       ├── commands/
│       └── agents/
├── src/                   ← 既存のソースコード
└── package.json`}</pre>
          </div>
          <p className={styles.fileStructureNote}>
            プラグインはリポジトリ内に配置されるため、git で管理・共有可能
          </p>
        </div>

        <div className={styles.extraInfo}>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <h4 className={styles.infoTitle}>単独でもプロジェクト内でも</h4>
              <p className={styles.infoText}>
                プラグイン単体で開発、または既存プロジェクト内で一緒に管理
              </p>
            </div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <h4 className={styles.infoTitle}>チーム共有も簡単</h4>
              <p className={styles.infoText}>
                <code>git pull</code> → <code>install .</code> でチーム全員に展開
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
