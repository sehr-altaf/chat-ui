import styles from './ChatHeader.module.css'

export default function ChatHeader({ status }) {
  return (
    <div className={styles.header}>
      <div className={styles.avatar}>🕌</div>
      <div className={styles.info}>
        <h1>Kashmir Craft Assistant</h1>
        <p>Authentic GI-Certified Handicrafts</p>
      </div>
      <span className={`${styles.dot} ${status === 'ready' ? styles.online : styles.away}`} />
    </div>
  )
}
