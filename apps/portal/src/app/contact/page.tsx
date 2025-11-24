import styles from './page.module.css';

export default function Contact() {
    return (
        <div className="container">
            <div className={styles.wrapper}>
                <h1 className={styles.title}>Contact</h1>
                <p className={styles.lead}>
                    Get in touch with the team.
                </p>

                <div className={`${styles.card} glass`}>
                    <h2 className={styles.heading}>brainfiber inc.</h2>
                    <p className={styles.text}>
                        We are the creators of viyv-claude-plugin.
                    </p>
                    <div className={styles.actions}>
                        <a
                            href="https://github.com/brainfiber/viyv-claude-plugin/issues"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.button}
                        >
                            Report an Issue
                        </a>
                        <a
                            href="mailto:support@brainfiber.com"
                            className={`${styles.button} ${styles.secondary}`}
                        >
                            Email Support
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
