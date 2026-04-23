import { useState } from 'react'
import styles from './TicketModal.module.css'

const CATEGORIES = ['General', 'Order', 'Shipping', 'Returns', 'Products', 'Payment', 'Authenticity', 'Other']
const PRIORITIES  = ['Low', 'Normal', 'High', 'Urgent']

export default function TicketModal({ sessionId, onClose }) {
  const [form, setForm] = useState({
    userName: '', userEmail: '', phoneNumber: '',
    subject: '', description: '', category: 'General', priority: 'Normal',
  })
  const [loading, setLoading] = useState(false)
  const [ticket, setTicket]   = useState(null)
  const [error, setError]     = useState('')

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setError('')
    if (!form.userName || !form.userEmail || !form.subject || !form.description) {
      setError('Please fill in all required fields.')
      return
    }
    setLoading(true)
    try {
      const base = import.meta.env.VITE_API_URL ?? ''
      const res = await fetch(`${base}/api/bot/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, sessionId }),
      })
      if (!res.ok) throw new Error(await res.text())
      setTicket(await res.json())
    } catch (ex) {
      setError(ex.message || 'Failed to raise ticket. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        {ticket ? (
          <div className={styles.success}>
            <div className={styles.checkIcon}>✅</div>
            <h3>Ticket Raised!</h3>
            <p>Our support team will contact you within 24 hours.</p>
            <span className={styles.ticketId}>{ticket.ticketId}</span>
            <button className={styles.btnPrimary} onClick={onClose}>Back to Chat</button>
          </div>
        ) : (
          <>
            <div className={styles.modalHeader}>
              <h2>🎫 Raise a Support Ticket</h2>
              <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
            </div>
            <p className={styles.subtitle}>Our team will get back to you within 24 hours.</p>

            {error && <div className={styles.errorBanner}>{error}</div>}

            <form onSubmit={submit} className={styles.form}>
              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label>Name <span className={styles.req}>*</span></label>
                  <input value={form.userName} onChange={set('userName')} placeholder="Your name" />
                </div>
                <div className={styles.field}>
                  <label>Email <span className={styles.req}>*</span></label>
                  <input type="email" value={form.userEmail} onChange={set('userEmail')} placeholder="you@example.com" />
                </div>
              </div>

              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label>Phone</label>
                  <input value={form.phoneNumber} onChange={set('phoneNumber')} placeholder="+91 …" />
                </div>
                <div className={styles.field}>
                  <label>Category</label>
                  <select value={form.category} onChange={set('category')}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className={styles.field}>
                <label>Subject <span className={styles.req}>*</span></label>
                <input value={form.subject} onChange={set('subject')} placeholder="Brief subject…" />
              </div>

              <div className={styles.field}>
                <label>Description <span className={styles.req}>*</span></label>
                <textarea value={form.description} onChange={set('description')} placeholder="Describe your issue…" rows={3} />
              </div>

              <div className={styles.field}>
                <label>Priority</label>
                <select value={form.priority} onChange={set('priority')}>
                  {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>

              <div className={styles.actions}>
                <button type="button" className={styles.btnCancel} onClick={onClose}>Cancel</button>
                <button type="submit" className={styles.btnPrimary} disabled={loading}>
                  {loading ? 'Raising…' : 'Raise Ticket'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
