'use client';

import styles from './Terminal.module.css';

type TerminalLine = {
  type: 'command' | 'output' | 'comment';
  text: string;
  prompt?: string;
};

type TerminalProps = {
  lines: TerminalLine[];
  title?: string;
  className?: string;
};

export default function Terminal({ lines, title = 'Terminal', className = '' }: TerminalProps) {
  return (
    <div className={`${styles.terminal} ${className}`}>
      <div className={styles.header}>
        <div className={styles.buttons}>
          <span className={styles.buttonRed} />
          <span className={styles.buttonYellow} />
          <span className={styles.buttonGreen} />
        </div>
        <span className={styles.title}>{title}</span>
        <div className={styles.spacer} />
      </div>
      <div className={styles.body}>
        {lines.map((line, index) => (
          <div key={index} className={styles.line}>
            {line.type === 'command' && (
              <>
                <span className={styles.prompt}>{line.prompt || '$'}</span>
                <span className={styles.command}>{line.text}</span>
              </>
            )}
            {line.type === 'output' && (
              <span className={styles.output}>{line.text}</span>
            )}
            {line.type === 'comment' && (
              <span className={styles.comment}># {line.text}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Preset terminal examples
export function TerminalQuickStart() {
  return (
    <Terminal
      title="viyv-claude-plugin"
      lines={[
        { type: 'comment', text: 'Create a new plugin project' },
        { type: 'command', text: 'npx viyv-claude-plugin new my-plugin' },
        { type: 'output', text: 'Created new plugin scaffold at ./my-plugin' },
        { type: 'output', text: '' },
        { type: 'comment', text: 'Register with Claude Code' },
        { type: 'command', text: 'npx viyv-claude-plugin setup' },
        { type: 'output', text: 'Registered marketplace: my-plugin' },
      ]}
    />
  );
}

export function TerminalInstall() {
  return (
    <Terminal
      title="Install from GitHub"
      lines={[
        { type: 'comment', text: 'Install plugin from GitHub' },
        { type: 'command', text: 'npx viyv-claude-plugin install github:user/repo' },
        { type: 'output', text: 'Installed plugin: my-plugin (1.0.0)' },
        { type: 'output', text: '' },
        { type: 'comment', text: 'Or install all plugins from marketplace' },
        { type: 'command', text: 'npx viyv-claude-plugin install ./marketplace --all' },
        { type: 'output', text: 'Installed plugin: plugin-a (1.0.0)' },
        { type: 'output', text: 'Installed plugin: plugin-b (1.0.0)' },
      ]}
    />
  );
}
