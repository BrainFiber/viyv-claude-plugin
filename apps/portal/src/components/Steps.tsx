'use client';

import { useEffect, useRef } from 'react';
import styles from './Steps.module.css';

const steps = [
  {
    number: '01',
    title: 'プラグイン作成',
    command: 'npx viyv-claude-plugin new my-plugin',
    description: '既存プロジェクトのルートで実行。.claude-plugin/ と plugins/ が作成されます。',
  },
  {
    number: '02',
    title: 'スキル開発',
    command: 'plugins/my-plugin/skills/ を編集',
    description: 'Markdown形式でスキル・コマンド・エージェントを定義。既存のソースと一緒に管理。',
  },
  {
    number: '03',
    title: 'Claude Codeに登録',
    command: 'npx viyv-claude-plugin setup',
    description: 'マーケットプレイスをClaude Codeに登録。開発者本人がすぐに利用開始。',
  },
  {
    number: '04',
    title: 'チームに展開',
    command: 'git pull && npx viyv-claude-plugin install .',
    description: 'チームメンバーはpull後に install . するだけ。全員が同じスキルを即適用できます。',
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
          <h2 className={styles.title}>4ステップでチーム展開</h2>
          <p className={styles.subtitle}>
            開発からチーム全員への展開まで、CLIだけで完結
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
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <h4 className={styles.infoTitle}>チーム全員が同じスキル</h4>
              <p className={styles.infoText}>
                リポジトリを共有するメンバーなら <code>install .</code> で即適用
              </p>
            </div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <div>
              <h4 className={styles.infoTitle}>更新も簡単</h4>
              <p className={styles.infoText}>
                <code>npx viyv-claude-plugin update</code> で変更を即反映
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
