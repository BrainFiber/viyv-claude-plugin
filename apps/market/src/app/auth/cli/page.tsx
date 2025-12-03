"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import styles from "./page.module.css";

function CliAuthContent() {
  const searchParams = useSearchParams();
  const redirectUri = searchParams.get("redirect");
  const [status, setStatus] = useState<"loading" | "authenticating" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // User is already logged in, generate token and redirect
        try {
          const response = await fetch("/api/auth/cli-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });

          if (response.ok) {
            const { token } = await response.json();

            if (redirectUri) {
              // Redirect to CLI's localhost callback
              window.location.href = `${redirectUri}?token=${token}`;
            } else {
              setStatus("success");
            }
          } else {
            throw new Error("Failed to generate token");
          }
        } catch {
          setError("Failed to generate CLI token");
          setStatus("error");
        }
      } else {
        // Not logged in, start OAuth flow
        setStatus("authenticating");
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "github",
          options: {
            redirectTo: `${window.location.origin}/auth/cli/callback${redirectUri ? `?redirect=${encodeURIComponent(redirectUri)}` : ""}`,
          },
        });

        if (error) {
          setError(error.message);
          setStatus("error");
        }
      }
    };

    checkAuthAndRedirect();
  }, [redirectUri]);

  return (
    <div className={styles.card}>
      <span className={styles.icon}>🔐</span>

      {status === "loading" && (
        <>
          <h1>Authenticating CLI...</h1>
          <p>Please wait while we verify your credentials.</p>
          <div className={styles.spinner} />
        </>
      )}

      {status === "authenticating" && (
        <>
          <h1>Redirecting to GitHub...</h1>
          <p>You&apos;ll be redirected to GitHub to authenticate.</p>
          <div className={styles.spinner} />
        </>
      )}

      {status === "success" && (
        <>
          <h1 className={styles.success}>Authentication Successful!</h1>
          <p>You can now close this window and return to your terminal.</p>
          <div className={styles.checkmark}>✓</div>
        </>
      )}

      {status === "error" && (
        <>
          <h1 className={styles.errorTitle}>Authentication Failed</h1>
          <p>{error || "An unexpected error occurred."}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </>
      )}
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className={styles.card}>
      <span className={styles.icon}>🔐</span>
      <h1>Loading...</h1>
      <div className={styles.spinner} />
    </div>
  );
}

export default function CliAuthPage() {
  return (
    <div className={styles.page}>
      <Suspense fallback={<LoadingFallback />}>
        <CliAuthContent />
      </Suspense>
    </div>
  );
}
