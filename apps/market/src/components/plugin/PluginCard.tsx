import Link from "next/link";
import styles from "./PluginCard.module.css";

export type PluginCardProps = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  keywords: string[];
  author: string;
  downloadCount: number;
  version: string | null;
};

const categoryColors: Record<string, string> = {
  "ai-ml": "purple",
  "devtools": "blue",
  "productivity": "green",
  "utility": "yellow",
  "integrations": "pink",
  "data": "cyan",
  "automation": "red",
  "documentation": "teal",
};

const categoryIcons: Record<string, string> = {
  "ai-ml": "🤖",
  "devtools": "🛠️",
  "productivity": "⚡",
  "utility": "🔧",
  "integrations": "🔗",
  "data": "📊",
  "automation": "🔄",
  "documentation": "📚",
};

export default function PluginCard({
  id,
  name,
  description,
  category,
  keywords,
  author,
  downloadCount,
  version,
}: PluginCardProps) {
  const colorClass = category ? categoryColors[category] || "purple" : "purple";
  const icon = category ? categoryIcons[category] || "🧩" : "🧩";

  const formatDownloads = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  return (
    <Link href={`/plugins/${id}`} className={`card ${styles.card}`}>
      <div className={`card-colorbar card-colorbar-${colorClass}`} />
      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.icon}>{icon}</span>
          <div className={styles.titleWrap}>
            <h3 className={styles.title}>{name}</h3>
            {version && <span className={styles.version}>v{version}</span>}
          </div>
        </div>

        <p className={styles.description}>
          {description || "No description provided."}
        </p>

        {keywords.length > 0 && (
          <div className={styles.tags}>
            {keywords.slice(0, 3).map((tag) => (
              <span key={tag} className={`pill pill-${colorClass}`}>
                {tag}
              </span>
            ))}
            {keywords.length > 3 && (
              <span className="pill">+{keywords.length - 3}</span>
            )}
          </div>
        )}

        <div className={styles.footer}>
          <span className={styles.author}>by @{author}</span>
          <div className={styles.stats}>
            <span className={`stat ${styles.downloads}`}>
              <span className="stat-downloads">{formatDownloads(downloadCount)}</span> downloads
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
