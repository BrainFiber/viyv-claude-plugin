import Link from "next/link";
import styles from "./page.module.css";

// Demo plugin data
const pluginData: Record<string, {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  category: string;
  keywords: string[];
  author: { username: string; avatar: string };
  downloadCount: number;
  version: string;
  updatedAt: string;
  createdAt: string;
  repository: string;
}> = {
  "weather-forecast": {
    id: "weather-forecast",
    name: "weather-forecast",
    description: "Get weather forecasts from Japan Meteorological Agency API.",
    longDescription: `## Overview

This plugin provides weather forecast capabilities for Claude Code, fetching data directly from the Japan Meteorological Agency (JMA) API.

## Features

- **Current Weather**: Get current weather conditions for any location in Japan
- **Weekly Forecast**: View 7-day weather forecasts
- **Alerts**: Receive weather warnings and advisories
- **Multi-language**: Supports Japanese and English

## Usage

\`\`\`bash
# Get current weather
/weather tokyo

# Get weekly forecast
/weather forecast osaka

# Get weather alerts
/weather alerts
\`\`\`

## Configuration

Add your preferred default location in the plugin settings.`,
    category: "data",
    keywords: ["weather", "api", "japanese", "forecast", "jma"],
    author: { username: "hiroki", avatar: "https://avatars.githubusercontent.com/u/1234567" },
    downloadCount: 1234,
    version: "1.2.0",
    updatedAt: "2025-01-15",
    createdAt: "2024-10-01",
    repository: "https://github.com/hiroki/weather-forecast-plugin",
  },
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

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PluginDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const plugin = pluginData[slug] || {
    id: slug,
    name: slug,
    description: "A Claude Code plugin.",
    longDescription: "No detailed description available.",
    category: "utility",
    keywords: [],
    author: { username: "unknown", avatar: "" },
    downloadCount: 0,
    version: "1.0.0",
    updatedAt: new Date().toISOString().split("T")[0],
    createdAt: new Date().toISOString().split("T")[0],
    repository: "",
  };

  const colorClass = categoryColors[plugin.category] || "purple";
  const icon = categoryIcons[plugin.category] || "🧩";

  const formatDownloads = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link href="/plugins">Plugins</Link>
          <span>/</span>
          <span>{plugin.name}</span>
        </nav>

        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerMain}>
            <span className={styles.icon}>{icon}</span>
            <div className={styles.headerInfo}>
              <h1>{plugin.name}</h1>
              <p className={styles.description}>{plugin.description}</p>
              <div className={styles.meta}>
                <span className={styles.author}>
                  by <Link href={`/publishers/${plugin.author.username}`}>@{plugin.author.username}</Link>
                </span>
                <span className={styles.separator}>•</span>
                <span>v{plugin.version}</span>
                <span className={styles.separator}>•</span>
                <span>Updated {plugin.updatedAt}</span>
              </div>
            </div>
          </div>

          <div className={styles.headerActions}>
            <div className={styles.stats}>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{formatDownloads(plugin.downloadCount)}</span>
                <span className={styles.statLabel}>downloads</span>
              </div>
            </div>
            <button className="btn btn-primary">Install</button>
          </div>
        </header>

        {/* Tags */}
        <div className={styles.tags}>
          <span className={`pill pill-${colorClass}`}>{plugin.category}</span>
          {plugin.keywords.map((tag) => (
            <span key={tag} className="pill">{tag}</span>
          ))}
        </div>

        {/* Install Command */}
        <div className={styles.installBox}>
          <h3>Install via CLI</h3>
          <div className={styles.installCommand}>
            <code>npx viyv-claude-plugin install market:{plugin.id}</code>
            <button className={styles.copyButton} title="Copy to clipboard">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={styles.content}>
          <div className={styles.readme}>
            <div className={styles.markdown}>
              {/* In production, render markdown properly */}
              <h2>Overview</h2>
              <p>
                This plugin provides weather forecast capabilities for Claude Code,
                fetching data directly from the Japan Meteorological Agency (JMA) API.
              </p>

              <h2>Features</h2>
              <ul>
                <li><strong>Current Weather</strong>: Get current weather conditions for any location in Japan</li>
                <li><strong>Weekly Forecast</strong>: View 7-day weather forecasts</li>
                <li><strong>Alerts</strong>: Receive weather warnings and advisories</li>
                <li><strong>Multi-language</strong>: Supports Japanese and English</li>
              </ul>

              <h2>Usage</h2>
              <pre><code>{`# Get current weather
/weather tokyo

# Get weekly forecast
/weather forecast osaka

# Get weather alerts
/weather alerts`}</code></pre>

              <h2>Configuration</h2>
              <p>Add your preferred default location in the plugin settings.</p>
            </div>
          </div>

          <aside className={styles.sidebar}>
            <div className={styles.sidebarSection}>
              <h4>Repository</h4>
              {plugin.repository ? (
                <a href={plugin.repository} target="_blank" rel="noopener noreferrer" className={styles.link}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  View on GitHub
                </a>
              ) : (
                <span className={styles.noLink}>No repository</span>
              )}
            </div>

            <div className={styles.sidebarSection}>
              <h4>Version History</h4>
              <ul className={styles.versionList}>
                <li>
                  <span className={styles.versionNumber}>v{plugin.version}</span>
                  <span className={styles.versionDate}>{plugin.updatedAt}</span>
                </li>
              </ul>
            </div>

            <div className={styles.sidebarSection}>
              <h4>Published</h4>
              <p>{plugin.createdAt}</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
