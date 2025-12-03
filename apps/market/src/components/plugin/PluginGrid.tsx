import PluginCard, { PluginCardProps } from "./PluginCard";
import styles from "./PluginGrid.module.css";

type PluginGridProps = {
  plugins: PluginCardProps[];
};

export default function PluginGrid({ plugins }: PluginGridProps) {
  if (plugins.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>🔍</span>
        <h3>No plugins found</h3>
        <p>Try adjusting your search or filters.</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {plugins.map((plugin, index) => (
        <div
          key={plugin.id}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <PluginCard {...plugin} />
        </div>
      ))}
    </div>
  );
}
