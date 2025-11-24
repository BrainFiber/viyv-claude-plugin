import CodeBlock from '@/components/CodeBlock';
import styles from './page.module.css';

export default function TeamGuide() {
    return (
        <div className="container">
            <div className={styles.wrapper}>
                <h1 className={styles.title}>Team & CI/CD Guide</h1>
                <p className={styles.lead}>
                    チーム開発と継続的インテグレーションのベストプラクティス。
                </p>

                <section className={styles.section}>
                    <h2 className={styles.heading}>チーム開発のフロー</h2>
                    <p className={styles.text}>
                        <code>viyv-claude-plugin</code> は、プラグイン定義をコードとして管理（IaC）することを前提に設計されています。
                        Git で管理し、Pull Request ベースで変更をレビューしましょう。
                    </p>

                    <div className={styles.grid}>
                        <div className={`${styles.card} glass`}>
                            <h3>1. 定義ファイル</h3>
                            <p>
                                <code>.claude-plugin/plugin.json</code> は自動生成されるため、Git管理対象外にすることも可能です（<code>.gitignore</code>）。
                                ただし、チームで共有する場合はコミットすることを推奨します。
                            </p>
                        </div>
                        <div className={`${styles.card} glass`}>
                            <h3>2. 依存関係</h3>
                            <p>
                                プラグインが必要とするnpmパッケージは、プロジェクトの <code>package.json</code> で管理します。
                                <code>node_modules</code> は共有せず、各開発者が <code>pnpm install</code> します。
                            </p>
                        </div>
                    </div>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.heading}>CI/CD パイプライン</h2>
                    <p className={styles.text}>
                        GitHub Actions などのCIツールで、プラグインの整合性を自動チェックできます。
                    </p>

                    <h3 className={styles.subheading}>GitHub Actions 例</h3>
                    <CodeBlock
                        filename=".github/workflows/test.yml"
                        code={`name: Test Plugin

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Build & Verify
        run: |
          pnpm build
          # プラグインのロードテスト（エラーがないか確認）
          node scripts/verify-plugins.js`}
                        language="yaml"
                    />
                </section>
            </div>
        </div>
    );
}
