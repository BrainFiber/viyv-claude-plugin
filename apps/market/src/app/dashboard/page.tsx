import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import styles from "./page.module.css";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/dashboard");
  }

  // Get user's profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Get user's plugins
  const { data: plugins } = await supabase
    .from("plugins")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  const totalDownloads = plugins?.reduce((sum, p) => sum + p.download_count, 0) || 0;

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.userInfo}>
            {profile?.avatar_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={profile.username}
                className={styles.avatar}
              />
            )}
            <div>
              <h1>Welcome, {profile?.display_name || profile?.username}</h1>
              <p>@{profile?.username}</p>
            </div>
          </div>
          <Link href="/dashboard/new" className="btn btn-primary">
            + New Plugin
          </Link>
        </header>

        {/* Stats */}
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{plugins?.length || 0}</span>
            <span className={styles.statLabel}>Plugins</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{totalDownloads}</span>
            <span className={styles.statLabel}>Total Downloads</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>
              {plugins?.filter(p => p.visibility === "public").length || 0}
            </span>
            <span className={styles.statLabel}>Public</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>
              {plugins?.filter(p => p.visibility === "private").length || 0}
            </span>
            <span className={styles.statLabel}>Private</span>
          </div>
        </div>

        {/* Plugins List */}
        <section className={styles.section}>
          <h2>Your Plugins</h2>

          {plugins && plugins.length > 0 ? (
            <div className={styles.pluginList}>
              {plugins.map((plugin) => (
                <div key={plugin.id} className={styles.pluginItem}>
                  <div className={styles.pluginInfo}>
                    <h3>{plugin.name}</h3>
                    <p>{plugin.description || "No description"}</p>
                    <div className={styles.pluginMeta}>
                      <span className={`pill ${plugin.visibility === "public" ? "pill-green" : "pill-orange"}`}>
                        {plugin.visibility}
                      </span>
                      {plugin.latest_version && <span>v{plugin.latest_version}</span>}
                      <span>{plugin.download_count} downloads</span>
                    </div>
                  </div>
                  <div className={styles.pluginActions}>
                    <Link href={`/plugins/${plugin.id}`} className="btn btn-secondary">
                      View
                    </Link>
                    <Link href={`/dashboard/${plugin.id}/settings`} className="btn btn-secondary">
                      Settings
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>📦</span>
              <h3>No plugins yet</h3>
              <p>Publish your first plugin using the CLI or create one here.</p>
              <div className={styles.emptyActions}>
                <Link href="/dashboard/new" className="btn btn-primary">
                  Create Plugin
                </Link>
                <Link href="/docs/cli" className="btn btn-secondary">
                  CLI Guide
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* Quick Start */}
        <section className={styles.section}>
          <h2>Quick Start</h2>
          <div className={styles.codeBlock}>
            <pre>
              <code>
{`# Install CLI
npm install -g viyv-claude-plugin

# Login to market
viyv-claude-plugin login

# Navigate to your plugin directory
cd my-plugin

# Publish your plugin
viyv-claude-plugin publish`}
              </code>
            </pre>
          </div>
        </section>
      </div>
    </div>
  );
}
