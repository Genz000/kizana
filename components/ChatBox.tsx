'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ChatMessage } from '@/types'

interface Props {
  hash: string
}

export default function ChatBox({ hash }: Props) {
  const router = useRouter()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [logoutHovered, setLogoutHovered] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return
    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      content: input.trim(),
      timestamp: Date.now(),
      sender: 'local',
    }
    setMessages((prev) => [...prev, msg])
    setInput('')
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b border-dim px-6 py-3 flex items-center gap-3">
        <span className="text-sm font-medium text-ink dark:text-paper">Room</span>
        <span className="text-xs text-muted font-mono">{hash.slice(0, 16)}…</span>
        <button
          onClick={() => router.push('/')}
          aria-label="Leave room"
          onMouseEnter={() => setLogoutHovered(true)}
          onMouseLeave={() => setLogoutHovered(false)}
          style={{
            marginLeft: 'auto',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: logoutHovered ? '#FF4A00' : 'transparent',
            border: '1px solid #FF4A00',
            borderRadius: 0,
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'background 0.15s ease',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 2H2v10h3" stroke={logoutHovered ? '#ffffff' : '#FF4A00'} strokeWidth="1.2" strokeLinecap="square"/>
            <path d="M9 10l3-3-3-3" stroke={logoutHovered ? '#ffffff' : '#FF4A00'} strokeWidth="1.2" strokeLinecap="square" strokeLinejoin="miter"/>
            <line x1="12" y1="7" x2="5" y2="7" stroke={logoutHovered ? '#ffffff' : '#FF4A00'} strokeWidth="1.2" strokeLinecap="square"/>
          </svg>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'local' ? 'justify-end' : 'justify-start'}`}
          >
            <span
              className={`px-3 py-1.5 text-sm max-w-xs break-words ${
                msg.sender === 'local'
                  ? 'bg-brand text-white'
                  : 'border border-dim text-ink dark:text-paper'
              }`}
            >
              {msg.content}
            </span>
          </div>
        ))}
        {messages.length === 0 && (
          <p className="text-sm text-muted text-center pt-16">No messages yet.</p>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="border-t border-dim px-6 py-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 border border-dim bg-transparent px-3 py-2 text-sm text-ink dark:text-paper placeholder:text-muted focus:outline-none focus:border-brand transition-colors"
        />
        <button
          type="submit"
          className="bg-brand text-white px-4 py-2 text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
          disabled={!input.trim()}
        >
          Send
        </button>
      </form>
    </div>
  )
}
