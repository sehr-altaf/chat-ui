import styles from './MessageBubble.module.css'

function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function MessageBubble({ msg, onQuickReply }) {
  const isUser = msg.role === 'user'

  return (
    <div>
      <div className={`${styles.row} ${isUser ? styles.user : styles.bot}`}>
        <div className={`${styles.avatar} ${isUser ? styles.avatarUser : ''}`}>
          {isUser ? '👤' : '🤖'}
        </div>
        <div className={styles.content}>
          <div className={`${styles.bubble} ${isUser ? styles.bubbleUser : styles.bubbleBot}`}>
            {msg.content}
          </div>
          <div className={`${styles.time} ${isUser ? styles.timeRight : ''}`}>
            {fmtTime(msg.timestamp)}
          </div>
        </div>
      </div>

      {!isUser && msg.quickReplies?.length > 0 && (
        <div className={styles.quickReplies}>
          {msg.quickReplies.map(qr => (
            <button
              key={qr.payload}
              className={styles.chip}
              onClick={() => onQuickReply(qr.payload)}
            >
              {qr.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
