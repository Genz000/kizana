'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { hashKey } from '@/lib/hashKey'
import DecryptedText from './DecryptedText'

export default function KeyInput() {
  const [key, setKey] = useState('')
  const [mode, setMode] = useState<'safe' | 'room'>('safe')
  const router = useRouter()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [titleSize, setTitleSize] = useState(0)
  const [titleReady, setTitleReady] = useState(false)
  const [sloganReady, setSloganReady] = useState(false)

  useEffect(() => {
    const fit = () => {
      if (!wrapperRef.current) return
      const available = wrapperRef.current.getBoundingClientRect().width
      if (!available) return

      const probe = document.createElement('span')
      probe.textContent = 'KIZANA'
      Object.assign(probe.style, {
        position: 'fixed',
        top: '-9999px',
        left: '-9999px',
        fontFamily: 'var(--font-martian-mono), monospace',
        fontWeight: '800',
        fontSize: '100px',
        whiteSpace: 'nowrap',
        visibility: 'hidden',
      })
      document.body.appendChild(probe)
      const refWidth = probe.getBoundingClientRect().width
      document.body.removeChild(probe)

      if (!refWidth) return
      setTitleSize((available / refWidth) * 100)
      setTitleReady(true)
    }
    document.fonts.ready.then(fit)
    const ro = new ResizeObserver(fit)
    if (wrapperRef.current) ro.observe(wrapperRef.current)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setSloganReady(true), 100)
    return () => clearTimeout(timer)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!key.trim()) return
    const hash = await hashKey(key)
    router.push(`/${mode}/${hash}`)
  }

  const hasKey = key.trim().length > 0

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm px-4">
      <div ref={wrapperRef} style={{ width: '100%', marginBottom: '40px' }}>
        <h1
          style={{
            fontFamily: 'var(--font-martian-mono), monospace',
            fontWeight: 800,
            fontSize: titleSize || undefined,
            textTransform: 'uppercase',
            lineHeight: 1,
            whiteSpace: 'nowrap',
            opacity: titleReady ? 1 : 0,
            transition: 'opacity 0.2s ease',
            margin: 0,
            padding: 0,
          }}
        >
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
        <p style={{
          display: 'block',
          width: '100%',
          textAlign: 'right',
          fontFamily: 'var(--font-martian-mono), monospace',
          fontWeight: 400,
          fontSize: '7px',
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: '#888780',
          marginTop: '4px',
          padding: 0,
          opacity: sloganReady ? 1 : 0,
          transition: 'opacity 0.1s ease',
        }}>
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
      <div className="border border-ink/10 dark:border-paper/10 flex w-full">
        {(['safe', 'room'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setMode(tab)}
            className={[
              'flex-1 py-2 font-[inherit] text-[11px] font-medium tracking-[0.1em] uppercase cursor-pointer transition-all duration-150',
              mode === tab
                ? 'bg-ink text-paper dark:bg-paper dark:text-ink border-none'
                : 'bg-transparent text-muted border-b border-ink/10 dark:border-paper/10',
            ].join(' ')}
            style={{ borderRadius: 0 }}
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
