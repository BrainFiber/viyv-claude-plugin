import Link from 'next/link';
import styles from './Header.module.css';

export default function Header() {
    return (
        <header className={`${styles.header} glass`}>
            <div className="container">
                <div className={styles.inner}>
                    <Link href="/" className={styles.logo}>
                        viyv-claude-plugin
                    </Link>

                    <nav className={styles.nav}>
                        <Link href="/features" className={styles.link}>Features</Link>
                        <Link href="/guides" className={styles.link}>Guides</Link>
                        <Link href="/api" className={styles.link}>API</Link>
                        <Link href="/examples" className={styles.link}>Examples</Link>
                    </nav>

                    <div className={styles.actions}>
                        <a
                            href="https://github.com/brainfiber/viyv-claude-plugin"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.github}
                        >
                            GitHub
                        </a>
                    </div>
                </div>
            </div>
        </header>
    );
}
