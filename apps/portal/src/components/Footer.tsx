import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className="container">
                <div className={styles.inner}>
                    <div className={styles.copyright}>
                        © {new Date().getFullYear()} brainfiber inc. All rights reserved.
                    </div>
                    <div className={styles.links}>
                        <a href="#" className={styles.link}>Privacy</a>
                        <a href="#" className={styles.link}>Terms</a>
                        <a href="#" className={styles.link}>Contact</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
