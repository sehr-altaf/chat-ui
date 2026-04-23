import { useState } from 'react'
import { useChat } from './hooks/useChat'
import ChatHeader from './components/ChatHeader'
import MessageList from './components/MessageList'
import ChatInput from './components/ChatInput'
import TicketModal from './components/TicketModal'
import styles from './App.module.css'

export default function App() {
  const { status, sessionId, messages, isTyping, showBanner, connError, sendMessage, setShowBanner, mode, setMode, chatConfig } = useChat()
  const [showTicket, setShowTicket] = useState(false)

  function handleQuickReply(payload) {
    if (payload === 'raise ticket') { setShowTicket(true); return }
    sendMessage(payload)
  }

  function handleModeChange(newMode) {
    setMode(newMode)
    const modeConfig = chatConfig.chatModes?.find(m => m.value === newMode)
    if (modeConfig?.escalate) setShowTicket(true)
  }

  return (
    <div className={styles.card}>
      <ChatHeader status={status} />

      {chatConfig.chatModes?.length > 0 && (
        <div className={styles.modeBar}>
          {chatConfig.chatModes.map(m => (
            <label
              key={m.value}
              className={`${styles.modeOption} ${mode === m.value ? styles.modeActive : ''}`}
            >
              <input
                type="radio"
                name="chatMode"
                value={m.value}
                checked={mode === m.value}
                onChange={() => handleModeChange(m.value)}
              />
              {m.icon && <span>{m.icon}</span>}
              <span>{m.label}</span>
            </label>
          ))}
        </div>
      )}

      {/* Connection overlays */}
      {status === 'connecting' && (
        <div className={styles.overlay}>
          <div className={styles.spinner} />
          <span className={styles.overlayText}>Connecting…</span>
        </div>
      )}
      {status === 'error' && (
        <div className={styles.overlay}>
          <span className={styles.errorIcon}>⚠️</span>
          <span className={styles.errorText}>{connError}</span>
        </div>
      )}

      <MessageList messages={messages} isTyping={isTyping} onQuickReply={handleQuickReply} />

      {showBanner && (
        <div className={styles.banner}>
          <span>💬 Need more help? Our support team can assist you.</span>
          <button onClick={() => { setShowBanner(false); setShowTicket(true) }}>
            Raise Ticket
          </button>
        </div>
      )}

      <ChatInput onSend={sendMessage} disabled={status !== 'ready'} />

      {showTicket && (
        <TicketModal sessionId={sessionId} onClose={() => setShowTicket(false)} />
      )}
    </div>
  )
}
