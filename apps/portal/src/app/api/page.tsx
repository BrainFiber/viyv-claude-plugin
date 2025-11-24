import styles from './page.module.css';

export default function ApiReference() {
    return (
        <div className="container">
            <div className={styles.wrapper}>
                <h1 className={styles.title}>API Reference</h1>
                <p className={styles.lead}>
                    Detailed documentation for the <code>ClaudePluginManager</code> class.
                </p>

                <section className={styles.section}>
                    <h2 className={styles.heading}>Methods</h2>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>メソッド</th>
                                    <th>説明</th>
                                    <th>戻り値</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><code>create(input)</code></td>
                                    <td>指定された設定で新規プラグインを作成します。</td>
                                    <td><code>Promise&lt;PluginMeta&gt;</code></td>
                                </tr>
                                <tr>
                                    <td><code>update(id, input)</code></td>
                                    <td>ID指定で既存プラグインを更新します。</td>
                                    <td><code>Promise&lt;PluginMeta&gt;</code></td>
                                </tr>
                                <tr>
                                    <td><code>get(id)</code></td>
                                    <td>ID指定でプラグインのメタデータを取得します。</td>
                                    <td><code>Promise&lt;PluginMeta&gt;</code></td>
                                </tr>
                                <tr>
                                    <td><code>list(filter?)</code></td>
                                    <td>全プラグインを一覧表示します（フィルタ可）。</td>
                                    <td><code>Promise&lt;PluginMeta[]&gt;</code></td>
                                </tr>
                                <tr>
                                    <td><code>delete(id)</code></td>
                                    <td>プラグインとそのディレクトリを削除します。</td>
                                    <td><code>Promise&lt;void&gt;</code></td>
                                </tr>
                                <tr>
                                    <td><code>importFromPath(input)</code></td>
                                    <td>ローカルディレクトリからプラグインを取り込みます。</td>
                                    <td><code>Promise&lt;PluginMeta&gt;</code></td>
                                </tr>
                                <tr>
                                    <td><code>importFromUrl(input)</code></td>
                                    <td>リモートのZIP URLからプラグインを取り込みます。</td>
                                    <td><code>Promise&lt;PluginMeta&gt;</code></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.heading}>Types</h2>
                    <div className={styles.typeBlock}>
                        <h3>CreatePluginInput</h3>
                        <pre><code>{`interface CreatePluginInput {
  name: string;
  version?: string;
  description?: string;
  skills?: SkillInput[];
  commands?: CommandInput[];
  agents?: AgentInput[];
  hooks?: HooksInput;
  mcpServers?: McpServersInput;
  tags?: string[];
}`}</code></pre>
                    </div>

                    <div className={styles.typeBlock}>
                        <h3>SkillInput</h3>
                        <pre><code>{`type SkillFileInput = {
  path: string;     // relative to skills/<id>, max one subdirectory
  content: string;
};

type SkillInput = {
  id: string;       // /^[a-z0-9-]{1,64}$/ and not containing "anthropic" or "claude"
  content: string;  // SKILL.md with YAML frontmatter { name, description }
  files?: SkillFileInput[];
};`}</code></pre>
                        <p className={styles.note}>
                            Skills are validated on create/update: frontmatter必須、name/description長さ、
                            XMLタグ禁止、行数500以内、ファイルパスは相対/フォワードスラッシュのみで1階層まで。
                        </p>
                    </div>

                    <div className={styles.typeBlock}>
                        <h3>PluginMeta</h3>
                        <pre><code>{`interface PluginMeta {
  id: string;
  name: string;
  version: string;
  description?: string;
  dirPath: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}`}</code></pre>
                    </div>
                </section>
            </div>
        </div>
    );
}
