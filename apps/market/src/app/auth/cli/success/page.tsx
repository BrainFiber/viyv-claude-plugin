"use client";

import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import styles from "./page.module.css";

function SuccessContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (token) {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.checkmark}>✓</div>
      <h1>Authentication Successful!</h1>
      <p>Copy this token and paste it in your terminal:</p>

      {token && (
        <div className={styles.tokenBox}>
          <code className={styles.token}>{token.slice(0, 20)}...{token.slice(-8)}</code>
          <button onClick={handleCopy} className={styles.copyButton}>
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      )}

      <p className={styles.warning}>
        This token will only be shown once. Keep it secure.
      </p>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className={styles.card}>
      <div className={styles.checkmark}>✓</div>
      <h1>Loading...</h1>
    </div>
  );
}

export default function CliSuccessPage() {
  return (
    <div className={styles.page}>
      <Suspense fallback={<LoadingFallback />}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
