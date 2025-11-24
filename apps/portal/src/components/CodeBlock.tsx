'use client';

import { useState } from 'react';
import styles from './CodeBlock.module.css';

interface CodeBlockProps {
    code: string;
    filename?: string;
}

export default function CodeBlock({ code, filename }: CodeBlockProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={styles.container}>
            {filename && <div className={styles.filename}>{filename}</div>}
            <div className={styles.wrapper}>
                <pre className={styles.pre}>
                    <code className={styles.code}>{code}</code>
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
