'use client'

import { useEffect, useRef, useState } from 'react'
import type { ChatMessage } from '@/types'

interface Props {
  hash: string
}

export default function ChatBox({ hash }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
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
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3" style={{ marginTop: '53px' }}>
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
