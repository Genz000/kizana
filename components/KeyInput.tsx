'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { hashKey } from '@/lib/hashKey'
import DecryptedText from './DecryptedText'

export default function KeyInput() {
  const [key, setKey] = useState('')
  const [mode, setMode] = useState<'safe' | 'room'>('safe')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!key.trim()) return
    const hash = await hashKey(key)
    router.push(`/${mode}/${hash}`)
  }

  const hasKey = key.trim().length > 0

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm px-4">
      <div className="flex flex-col items-start mb-10">
        <h1 className="text-[48px] font-medium tracking-[0.08em] uppercase leading-none">
          <DecryptedText
            text="KIZANA"
            animateOn="view"
            sequential={true}
            revealDirection="start"
            speed={60}
            characters="0123456789ABCDEF"
            className="text-ink dark:text-paper"
            encryptedClassName="text-muted opacity-40"
          />
        </h1>
        <p className="text-[11px] tracking-[0.16em] uppercase text-muted self-end mt-1">
          <DecryptedText
            text="YOUR CRYPTED SECRET"
            animateOn="view"
            sequential={true}
            revealDirection="end"
            speed={40}
            characters="0123456789ABCDEF"
            className="text-muted"
            encryptedClassName="text-muted opacity-25"
          />
        </p>
      </div>
      <div style={{ border: '1px solid #e0e0e0', display: 'flex', width: '100%' }}>
        {(['safe', 'room'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setMode(tab)}
            style={{
              flex: 1,
              padding: '8px 0',
              fontFamily: 'inherit',
              fontSize: '11px',
              fontWeight: 500,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              borderRadius: 0,
              border: 'none',
              borderBottom: mode === tab ? 'none' : '2px solid #e0e0e0',
              background: mode === tab ? '#0a0a0a' : 'transparent',
              color: mode === tab ? '#ffffff' : '#888888',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {tab === 'safe' ? 'Safe' : 'Room'}
          </button>
        ))}
      </div>
      <input
        type="password"
        value={key}
        onChange={(e) => setKey(e.target.value)}
        placeholder="Enter your key…"
        autoComplete="off"
        className="border border-dim bg-transparent px-3 py-2 text-ink dark:text-paper placeholder:text-muted focus:outline-none focus:border-brand transition-colors mb-5"
      />
      <button
        type="submit"
        disabled={!hasKey}
        style={{
          padding: '8px 16px',
          border: '1px solid #FF4A00',
          background: hasKey ? '#FF4A00' : 'transparent',
          color: hasKey ? '#ffffff' : '#FF4A00',
          cursor: hasKey ? 'pointer' : 'not-allowed',
          opacity: hasKey ? 1 : 0.6,
          transition: 'all 0.2s ease',
          borderRadius: 0,
          fontSize: '14px',
        }}
      >
        Open {mode === 'safe' ? 'Safe' : 'Room'}
      </button>
    </form>
  )
}
