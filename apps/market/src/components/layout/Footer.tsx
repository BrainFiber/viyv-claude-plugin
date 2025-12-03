import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.container}`}>
        <div className={styles.brand}>
          <Link href="/" className={styles.logo}>
            <span>🧩</span>
            <span className="gradient-text">viyv</span>
            <span className={styles.logoSub}>market</span>
          </Link>
          <p className={styles.tagline}>
            The official marketplace for Claude Code plugins.
          </p>
        </div>

        <div className={styles.links}>
          <div className={styles.linkGroup}>
            <h4>Product</h4>
            <Link href="/plugins">Browse Plugins</Link>
            <Link href="/categories">Categories</Link>
            <Link href="/dashboard">Publish</Link>
          </div>

          <div className={styles.linkGroup}>
            <h4>Resources</h4>
            <Link href="/docs">Documentation</Link>
            <Link href="/docs/cli">CLI Guide</Link>
            <Link href="https://github.com/brainfiber/viyv-claude-plugin" target="_blank">
              GitHub
            </Link>
          </div>

          <div className={styles.linkGroup}>
            <h4>Legal</h4>
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>&copy; {new Date().getFullYear()} viyv-claude-plugin-market. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
