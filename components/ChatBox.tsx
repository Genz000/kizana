'use client'

import { useEffect, useRef, useState } from 'react'
import type { ChatMessage } from '@/types'

interface Props {
  hash: string
}

export default function ChatBox({ hash }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [displayName, setDisplayName] = useState('ANON')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const name = sessionStorage.getItem('kizana_room_name') || `USER ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`
    setDisplayName(name)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return
    const message: ChatMessage = {
      id: crypto.randomUUID(),
      sender: displayName,
      content: input.trim(),
      timestamp: Date.now(),
    }
    setMessages((prev) => [...prev, message])
    setInput('')
  }

  return (
    <div className="flex flex-col h-screen" data-room={hash}>
      <div
        className="flex-1 overflow-y-auto px-6 py-4"
        style={{ marginTop: '53px' }}
      >
        {messages.length === 0 && (
          <p
            style={{
              fontFamily: 'var(--font-geist-mono)',
              fontSize: '10px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#888780',
              textAlign: 'center',
              paddingTop: '64px',
            }}
          >
            NO MESSAGES YET
          </p>
        )}
        {messages.map((message) => {
          const isMe = message.sender === displayName
          return (
            <div
              key={message.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isMe ? 'flex-end' : 'flex-start',
                marginBottom: '12px',
              }}
            >
              <span
                style={{
                  fontSize: '8px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  opacity: 0.3,
                  marginBottom: '3px',
                  color: isMe ? '#FF4A00' : 'inherit',
                  fontFamily: 'var(--font-geist-mono)',
                }}
              >
                {message.sender}
              </span>
              <div
                style={{
                  maxWidth: '70%',
                  padding: '8px 12px',
                  border: isMe
                    ? '0.5px solid #FF4A00'
                    : '0.5px solid rgba(255,255,255,0.15)',
                  color: isMe ? '#FF4A00' : 'inherit',
                  fontFamily: 'var(--font-geist-mono)',
                  fontSize: '13px',
                  letterSpacing: '0.04em',
                  lineHeight: 1.5,
                  borderRadius: '2px',
                }}
              >
                {message.content}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSend}
        style={{
          borderTop: '0.5px solid rgba(128,128,128,0.2)',
          padding: '12px 24px',
          display: 'flex',
          gap: '8px',
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="type a message..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            borderTop: '0.5px solid rgba(128,128,128,0.2)',
            borderBottom: '0.5px solid rgba(128,128,128,0.2)',
            padding: '8px 0',
            fontFamily: 'var(--font-geist-mono)',
            fontSize: '13px',
            letterSpacing: '0.04em',
            color: 'inherit',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={!input.trim()}
          style={{
            background: input.trim() ? '#FF4A00' : 'transparent',
            border: '0.5px solid #FF4A00',
            color: input.trim() ? '#fff' : '#FF4A00',
            fontFamily: 'var(--font-geist-mono)',
            fontSize: '11px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            padding: '8px 16px',
            cursor: input.trim() ? 'pointer' : 'not-allowed',
            opacity: input.trim() ? 1 : 0.4,
            transition: 'all 0.15s ease',
            borderRadius: 0,
          }}
        >
          SEND
        </button>
      </form>
    </div>
  )
}
