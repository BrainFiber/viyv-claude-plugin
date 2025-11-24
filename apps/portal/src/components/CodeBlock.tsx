'use client';

import { useState, ReactNode } from 'react';
import styles from './CodeBlock.module.css';

interface CodeBlockProps {
  code?: string;
  filename?: string;
  children?: ReactNode;
  language?: string; // kept for backward compatibility but not used
}

export default function CodeBlock({ code, filename, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const content = code || (typeof children === 'string' ? children : '');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.container}>
      {filename && <div className={styles.filename}>{filename}</div>}
      <div className={styles.wrapper}>
        <pre className={styles.pre}>
          <code className={styles.code}>{content}</code>
        </pre>
        <button
          className={styles.copyButton}
          onClick={handleCopy}
          aria-label="Copy code"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
}
