import { useState, useEffect, useRef, useCallback } from 'react'
import * as signalR from '@microsoft/signalr'

function genId() {
  return Math.random().toString(36).slice(2)
}

const DEFAULT_CONFIG = {
  chatModes: [
    { value: 'bot',            label: 'Gemini AI',      icon: '🤖', escalate: false },
    { value: 'representative', label: 'Representative',  icon: '👤', escalate: true  },
  ],
  welcomeMessage: {
    content: 'Welcome! How can I help you today?',
    quickReplies: [],
  },
  messages: {
    connectionError: 'Unable to connect to chat service. Make sure the API is running.',
    disconnected:    'Disconnected from server. Please refresh the page.',
    sendError:       'Failed to send message. Please try again.',
    serverError:     'Something went wrong. Please try again.',
  },
}

export function useChat() {
  const [status, setStatus]         = useState('connecting')
  const [sessionId, setSessionId]   = useState(null)
  const [messages, setMessages]     = useState([])
  const [isTyping, setIsTyping]     = useState(false)
  const [showBanner, setShowBanner] = useState(false)
  const [connError, setConnError]   = useState('')
  const [mode, setMode]             = useState(null)   // set from config once loaded
  const [chatConfig, setChatConfig] = useState(DEFAULT_CONFIG)
  const connRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    const base = import.meta.env.VITE_API_URL ?? ''

    async function start() {
      // ── 1. Load bot config ───────────────────────────────────────────────
      let cfg = DEFAULT_CONFIG
      try {
        const res = await fetch(`${base}/api/bot/config`)
        if (res.ok) {
          cfg = await res.json()
        }
      } catch {
        // server not reachable yet — fall back to defaults silently
      }

      if (cancelled) return
      setChatConfig(cfg)

      // Default mode = first non-escalating mode (usually 'bot')
      const defaultMode = cfg.chatModes?.find(m => !m.escalate)?.value ?? 'bot'
      setMode(defaultMode)

      // ── 2. Connect to SignalR ────────────────────────────────────────────
      const connection = new signalR.HubConnectionBuilder()
        .withUrl(`${base}/hubs/chat`)
        .withAutomaticReconnect([0, 2000, 5000, 10000])
        .configureLogging(signalR.LogLevel.Warning)
        .build()

      connection.on('Typing', () => { if (!cancelled) setIsTyping(true) })

      connection.on('BotMessage', (msg) => {
        if (cancelled) return
        setIsTyping(false)
        setMessages(prev => [...prev, {
          id:           msg.messageId || genId(),
          role:         'bot',
          content:      msg.reply,
          timestamp:    msg.timestamp || new Date().toISOString(),
          quickReplies: msg.quickReplies,
        }])
        if (msg.suggestTicket) setShowBanner(true)
      })

      connection.on('BotError', (err) => {
        if (cancelled) return
        setIsTyping(false)
        setMessages(prev => [...prev, {
          id:        genId(),
          role:      'bot',
          content:   err.error || cfg.messages?.serverError || DEFAULT_CONFIG.messages.serverError,
          timestamp: new Date().toISOString(),
        }])
      })

      connection.onreconnecting(() => { if (!cancelled) setStatus('connecting') })
      connection.onreconnected(()  => { if (!cancelled) setStatus('ready') })
      connection.onclose(() => {
        if (cancelled) return
        setStatus('error')
        setConnError(cfg.messages?.disconnected || DEFAULT_CONFIG.messages.disconnected)
      })

      try {
        await connection.start()
        if (cancelled) { connection.stop(); return }

        const result = await connection.invoke('StartSession', '', '')
        if (cancelled) { connection.stop(); return }

        setSessionId(result.sessionId)
        connRef.current = connection
        setStatus('ready')

        // Build welcome message from config
        const welcome = cfg.welcomeMessage ?? DEFAULT_CONFIG.welcomeMessage
        setMessages([{
          id:           'welcome',
          role:         'bot',
          content:      welcome.content,
          timestamp:    new Date().toISOString(),
          quickReplies: welcome.quickReplies ?? [],
        }])
      } catch (ex) {
        if (cancelled) return
        setStatus('error')
        setConnError(cfg.messages?.connectionError || DEFAULT_CONFIG.messages.connectionError)
        console.error('SignalR error:', ex)
      }

      return connection
    }

    let connectionRef = null
    start().then(conn => { connectionRef = conn })

    return () => {
      cancelled = true
      connRef.current = null
      connectionRef?.stop()
    }
  }, [])

  const sendMessage = useCallback(async (text) => {
    const msg = text?.trim()
    if (!msg || !connRef.current || status !== 'ready') return

    setShowBanner(false)
    setMessages(prev => [...prev, {
      id:        genId(),
      role:      'user',
      content:   msg,
      timestamp: new Date().toISOString(),
    }])

    try {
      await connRef.current.invoke('SendMessage', sessionId, msg, mode ?? 'bot')
    } catch {
      setIsTyping(false)
      setMessages(prev => [...prev, {
        id:        genId(),
        role:      'bot',
        content:   chatConfig.messages?.sendError || DEFAULT_CONFIG.messages.sendError,
        timestamp: new Date().toISOString(),
      }])
    }
  }, [sessionId, status, mode, chatConfig])

  return {
    status, sessionId, messages, isTyping, showBanner, connError,
    sendMessage, setShowBanner,
    mode, setMode,
    chatConfig,
  }
}
