import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import styles from './MessageList.module.css'

export default function MessageList({ messages, isTyping, onQuickReply }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  return (
    <div className={styles.list}>
      {messages.map(msg => (
        <MessageBubble key={msg.id} msg={msg} onQuickReply={onQuickReply} />
      ))}
      {isTyping && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  )
}
