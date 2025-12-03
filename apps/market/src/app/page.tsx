import Link from "next/link";
import PluginGrid from "@/components/plugin/PluginGrid";
import styles from "./page.module.css";

// Demo data for initial development
const demoPlugins = [
  {
    id: "weather-forecast",
    name: "weather-forecast",
    description: "Get weather forecasts from Japan Meteorological Agency API. Supports current weather and weekly forecasts.",
    category: "data",
    keywords: ["weather", "api", "japanese"],
    author: "hiroki",
    downloadCount: 1234,
    version: "1.2.0",
  },
  {
    id: "code-reviewer",
    name: "code-reviewer",
    description: "Automatically review your code for best practices, security issues, and performance improvements.",
    category: "devtools",
    keywords: ["review", "lint", "security"],
    author: "brainfiber",
    downloadCount: 5678,
    version: "2.0.1",
  },
  {
    id: "markdown-enhancer",
    name: "markdown-enhancer",
    description: "Enhance your markdown with diagrams, charts, and interactive elements.",
    category: "productivity",
    keywords: ["markdown", "diagrams", "mermaid"],
    author: "devtools",
    downloadCount: 890,
    version: "1.0.0",
  },
  {
    id: "api-tester",
    name: "api-tester",
    description: "Test and debug REST APIs directly from Claude Code with automatic request/response logging.",
    category: "devtools",
    keywords: ["api", "rest", "testing"],
    author: "apidev",
    downloadCount: 3456,
    version: "1.5.2",
  },
  {
    id: "git-helper",
    name: "git-helper",
    description: "Smart Git commands with AI-powered commit messages and branch management.",
    category: "utility",
    keywords: ["git", "vcs", "automation"],
    author: "gitmaster",
    downloadCount: 7890,
    version: "3.1.0",
  },
  {
    id: "database-query",
    name: "database-query",
    description: "Query and manage databases with natural language. Supports PostgreSQL, MySQL, and SQLite.",
    category: "data",
    keywords: ["database", "sql", "query"],
    author: "datadev",
    downloadCount: 2345,
    version: "2.2.0",
  },
  {
    id: "slack-integration",
    name: "slack-integration",
    description: "Send messages, manage channels, and automate workflows in Slack from Claude Code.",
    category: "integrations",
    keywords: ["slack", "chat", "notifications"],
    author: "integrator",
    downloadCount: 4567,
    version: "1.3.0",
  },
  {
    id: "doc-generator",
    name: "doc-generator",
    description: "Generate comprehensive documentation from your codebase automatically.",
    category: "documentation",
    keywords: ["docs", "readme", "jsdoc"],
    author: "docwriter",
    downloadCount: 6789,
    version: "2.0.0",
  },
];

const categories = [
  { id: "ai-ml", name: "AI & ML", icon: "🤖", count: 24 },
  { id: "devtools", name: "Developer Tools", icon: "🛠️", count: 45 },
  { id: "productivity", name: "Productivity", icon: "⚡", count: 32 },
  { id: "utility", name: "Utilities", icon: "🔧", count: 28 },
  { id: "integrations", name: "Integrations", icon: "🔗", count: 19 },
  { id: "data", name: "Data & APIs", icon: "📊", count: 21 },
];

export default function HomePage() {
  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBackground} />
        <div className={`container ${styles.heroContent}`}>
          <h1 className={styles.heroTitle}>
            Discover <span className="gradient-text">Claude Code</span> Plugins
          </h1>
          <p className={styles.heroSubtitle}>
            Explore {demoPlugins.length * 30}+ plugins to supercharge your development workflow.
            Build, share, and install with a single command.
          </p>

          {/* Search Bar */}
          <div className={styles.searchWrapper}>
            <div className="search-bar">
              <svg
                className={styles.searchIcon}
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input type="text" placeholder="Search plugins..." />
              <button className="btn btn-primary">Search</button>
            </div>
          </div>

          {/* Stats */}
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>240+</span>
              <span className={styles.statLabel}>Plugins</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statValue}>12.5k</span>
              <span className={styles.statLabel}>Downloads</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statValue}>89</span>
              <span className={styles.statLabel}>Publishers</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className={styles.categories}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2>Browse by Category</h2>
            <Link href="/categories" className={styles.viewAll}>
              View all →
            </Link>
          </div>
          <div className={styles.categoryGrid}>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/plugins?category=${cat.id}`}
                className={styles.categoryCard}
              >
                <span className={styles.categoryIcon}>{cat.icon}</span>
                <span className={styles.categoryName}>{cat.name}</span>
                <span className={styles.categoryCount}>{cat.count}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Plugins */}
      <section className={styles.featured}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2>Popular Plugins</h2>
            <Link href="/plugins" className={styles.viewAll}>
              View all →
            </Link>
          </div>
          <PluginGrid plugins={demoPlugins} />
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className="container">
          <div className={styles.ctaCard}>
            <div className={styles.ctaContent}>
              <h2>Ready to publish your plugin?</h2>
              <p>
                Share your creation with the Claude Code community.
                Publishing is free and takes just a few minutes.
              </p>
              <div className={styles.ctaButtons}>
                <Link href="/docs/cli" className="btn btn-primary">
                  Read the docs
                </Link>
                <Link href="/dashboard" className="btn btn-secondary">
                  Get started
                </Link>
              </div>
            </div>
            <div className={styles.ctaCode}>
              <pre>
                <code>
                  <span className={styles.codeComment}># Install CLI</span>
                  {"\n"}npm install -g viyv-claude-plugin
                  {"\n\n"}
                  <span className={styles.codeComment}># Login to market</span>
                  {"\n"}viyv-claude-plugin login
                  {"\n\n"}
                  <span className={styles.codeComment}># Publish your plugin</span>
                  {"\n"}viyv-claude-plugin publish
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
