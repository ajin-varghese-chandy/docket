import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../AuthContext.jsx'
import { subscribeToChat, sendChatMessage } from '../chat.js'
import { time } from '../format.js'
import Avatar from './Avatar.jsx'

const MINE_BUBBLE = 'rounded-[14px] rounded-br-[4px] bg-indigo-600 text-white'
const THEIR_BUBBLE = 'rounded-[14px] rounded-bl-[4px] border border-slate-200 bg-white text-slate-900'
const MINE_BUBBLE_CLIENT = 'rounded-[14px] rounded-br-[4px] bg-emerald-600 text-white'

export default function ProjectChat({ projectId }) {
  const { user } = useAuth()
  const isFreelancer = user.role === 'freelancer'

  const [messages, setMessages] = useState(null)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    let unsubscribe
    try {
      unsubscribe = subscribeToChat(
        projectId,
        (rows) => {
          setMessages(rows)
          setError('')
        },
        (err) => setError(err.message),
      )
    } catch (err) {
      setError(err.message)
      setMessages([])
    }
    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [projectId])

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(event) {
    event.preventDefault()
    const text = draft.trim()
    if (!text || sending) return

    setSending(true)
    try {
      await sendChatMessage(projectId, user, text)
      setDraft('')
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  if (error && !messages) {
    return (
      <p className="my-2.5 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
        {error}
      </p>
    )
  }

  return (
    <section className="mb-4 flex h-[540px] flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-3.5">
        <h2 className="text-base font-semibold">Project chat</h2>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto px-5 py-4">
        {messages === null ? <p className="text-slate-500">Loading…</p> : null}

        {messages && messages.length === 0 ? (
          <p className="my-auto text-center text-sm text-slate-500">No messages yet. Say hello 👋</p>
        ) : null}

        {messages
          ? messages.map((message) => {
              const mine = message.senderId === user.id
              return (
                <div
                  className={'flex flex-col ' + (mine ? 'items-end' : 'items-start')}
                  key={message.id}
                >
                  <div className="flex items-center gap-2">
                    {!mine ? <Avatar name={message.senderName} size={26} /> : null}
                    <span className="text-xs font-semibold text-slate-600">
                      {mine ? 'You' : message.senderName}
                    </span>
                  </div>
                  <p
                    className={
                      'mt-1 max-w-[75%] whitespace-pre-wrap break-words px-3.5 py-2 text-sm ' +
                      (mine
                        ? isFreelancer
                          ? MINE_BUBBLE
                          : MINE_BUBBLE_CLIENT
                        : THEIR_BUBBLE)
                    }
                  >
                    {message.text}
                  </p>
                  <span className="mt-1 text-[11px] text-slate-400">{time(message.createdAt)}</span>
                </div>
              )
            })
          : null}

        {error ? (
          <p className="rounded-[10px] border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
            {error}
          </p>
        ) : null}

        <div ref={bottomRef} />
      </div>

      <form
        className="flex items-center gap-2.5 border-t border-slate-200 px-5 py-3.5"
        onSubmit={handleSend}
      >
        <input
          className="min-w-0 flex-1 rounded-[10px] border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-400"
          placeholder="Type a message…"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <button
          className={
            'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-[10px] px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ' +
            (isFreelancer
              ? 'bg-indigo-600 hover:bg-indigo-700'
              : 'bg-emerald-600 hover:bg-emerald-700')
          }
          disabled={!draft.trim() || sending}
          type="submit"
        >
          {sending ? 'Sending…' : 'Send'}
        </button>
      </form>
    </section>
  )
}
