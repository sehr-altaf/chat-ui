import { useState, useRef } from 'react'
import styles from './ChatInput.module.css'

export default function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState('')
  const ref = useRef(null)

  function submit() {
    if (!text.trim() || disabled) return
    onSend(text.trim())
    setText('')
    ref.current?.focus()
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className={styles.area}>
      <textarea
        ref={ref}
        className={styles.input}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Type a message… (Enter to send)"
        rows={1}
        disabled={disabled}
      />
      <button
        className={styles.sendBtn}
        onClick={submit}
        disabled={!text.trim() || disabled}
        aria-label="Send"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width={18} height={18}>
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
      </button>
    </div>
  )
}
