"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Header.module.css";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className={`${styles.header} glass`}>
      <div className={`container ${styles.container}`}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>🧩</span>
          <span className={styles.logoText}>
            <span className="gradient-text">viyv</span>
            <span className={styles.logoSub}>market</span>
          </span>
        </Link>

        <nav className={styles.nav}>
          <Link
            href="/plugins"
            className={`${styles.navLink} ${pathname === "/plugins" ? styles.active : ""}`}
          >
            Browse
          </Link>
          <Link
            href="/categories"
            className={`${styles.navLink} ${pathname === "/categories" ? styles.active : ""}`}
          >
            Categories
          </Link>
          <Link
            href="/docs"
            className={`${styles.navLink} ${pathname === "/docs" ? styles.active : ""}`}
          >
            Docs
          </Link>
        </nav>

        <div className={styles.actions}>
          <Link href="/auth/login" className="btn btn-secondary">
            Sign in
          </Link>
          <Link href="/dashboard" className="btn btn-primary">
            Publish
          </Link>
        </div>
      </div>
    </header>
  );
}
