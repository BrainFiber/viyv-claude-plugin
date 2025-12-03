import PluginGrid from "@/components/plugin/PluginGrid";
import styles from "./page.module.css";

// Demo data
const allPlugins = [
  {
    id: "weather-forecast",
    name: "weather-forecast",
    description: "Get weather forecasts from Japan Meteorological Agency API.",
    category: "data",
    keywords: ["weather", "api", "japanese"],
    author: "hiroki",
    downloadCount: 1234,
    version: "1.2.0",
  },
  {
    id: "code-reviewer",
    name: "code-reviewer",
    description: "Automatically review your code for best practices and security.",
    category: "devtools",
    keywords: ["review", "lint", "security"],
    author: "brainfiber",
    downloadCount: 5678,
    version: "2.0.1",
  },
  {
    id: "markdown-enhancer",
    name: "markdown-enhancer",
    description: "Enhance your markdown with diagrams and interactive elements.",
    category: "productivity",
    keywords: ["markdown", "diagrams", "mermaid"],
    author: "devtools",
    downloadCount: 890,
    version: "1.0.0",
  },
  {
    id: "api-tester",
    name: "api-tester",
    description: "Test and debug REST APIs directly from Claude Code.",
    category: "devtools",
    keywords: ["api", "rest", "testing"],
    author: "apidev",
    downloadCount: 3456,
    version: "1.5.2",
  },
  {
    id: "git-helper",
    name: "git-helper",
    description: "Smart Git commands with AI-powered commit messages.",
    category: "utility",
    keywords: ["git", "vcs", "automation"],
    author: "gitmaster",
    downloadCount: 7890,
    version: "3.1.0",
  },
  {
    id: "database-query",
    name: "database-query",
    description: "Query databases with natural language. Supports PostgreSQL, MySQL.",
    category: "data",
    keywords: ["database", "sql", "query"],
    author: "datadev",
    downloadCount: 2345,
    version: "2.2.0",
  },
  {
    id: "slack-integration",
    name: "slack-integration",
    description: "Send messages and automate workflows in Slack.",
    category: "integrations",
    keywords: ["slack", "chat", "notifications"],
    author: "integrator",
    downloadCount: 4567,
    version: "1.3.0",
  },
  {
    id: "doc-generator",
    name: "doc-generator",
    description: "Generate comprehensive documentation from your codebase.",
    category: "documentation",
    keywords: ["docs", "readme", "jsdoc"],
    author: "docwriter",
    downloadCount: 6789,
    version: "2.0.0",
  },
  {
    id: "ai-assistant",
    name: "ai-assistant",
    description: "Enhanced AI capabilities for code generation and analysis.",
    category: "ai-ml",
    keywords: ["ai", "ml", "generation"],
    author: "aidev",
    downloadCount: 9876,
    version: "3.0.0",
  },
  {
    id: "test-runner",
    name: "test-runner",
    description: "Run and manage tests with intelligent test selection.",
    category: "devtools",
    keywords: ["test", "jest", "vitest"],
    author: "tester",
    downloadCount: 5432,
    version: "2.1.0",
  },
  {
    id: "docker-manager",
    name: "docker-manager",
    description: "Manage Docker containers and images from Claude Code.",
    category: "utility",
    keywords: ["docker", "containers", "devops"],
    author: "devops",
    downloadCount: 3210,
    version: "1.4.0",
  },
  {
    id: "notion-sync",
    name: "notion-sync",
    description: "Sync your notes and documentation with Notion.",
    category: "integrations",
    keywords: ["notion", "sync", "notes"],
    author: "notiondev",
    downloadCount: 2109,
    version: "1.1.0",
  },
];

const categories = [
  { id: "all", name: "All", count: allPlugins.length },
  { id: "ai-ml", name: "AI & ML", count: 1 },
  { id: "devtools", name: "Developer Tools", count: 3 },
  { id: "productivity", name: "Productivity", count: 1 },
  { id: "utility", name: "Utilities", count: 2 },
  { id: "integrations", name: "Integrations", count: 2 },
  { id: "data", name: "Data & APIs", count: 2 },
  { id: "documentation", name: "Documentation", count: 1 },
];

export default function PluginsPage() {
  return (
    <div className={styles.page}>
      <div className="container">
        <header className={styles.header}>
          <h1>Browse Plugins</h1>
          <p>Discover plugins to enhance your Claude Code experience.</p>
        </header>

        <div className={styles.layout}>
          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.filterSection}>
              <h3>Categories</h3>
              <div className={styles.filterList}>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    className={`${styles.filterItem} ${cat.id === "all" ? styles.active : ""}`}
                  >
                    <span>{cat.name}</span>
                    <span className={styles.filterCount}>{cat.count}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterSection}>
              <h3>Sort by</h3>
              <select className={`input ${styles.sortSelect}`}>
                <option value="popular">Most Popular</option>
                <option value="recent">Recently Updated</option>
                <option value="downloads">Most Downloads</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </aside>

          {/* Main Content */}
          <main className={styles.main}>
            <div className={styles.searchBar}>
              <div className="search-bar" style={{ maxWidth: "100%" }}>
                <svg
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
              </div>
            </div>

            <div className={styles.results}>
              <span>{allPlugins.length} plugins found</span>
            </div>

            <PluginGrid plugins={allPlugins} />
          </main>
        </div>
      </div>
    </div>
  );
}
