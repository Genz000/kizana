'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { hashKey } from '@/lib/hashKey'
import DecryptedText from './DecryptedText'

type PageState = 'input' | 'checking' | 'pin-entry' | 'founder' | 'wrong-pin'

const inputClass =
  'w-full border-t border-b border-dim bg-paper dark:bg-ink px-3 py-2 text-[11px] tracking-[0.1em] uppercase text-ink dark:text-paper placeholder:text-muted focus:outline-none focus:border-brand transition-colors font-[inherit]'

const primaryBtn =
  'w-full px-4 py-2 border border-brand bg-brand text-white text-[11px] tracking-[0.1em] uppercase font-medium cursor-pointer transition-all duration-200 font-[inherit]'

const ghostBtn =
  'w-full px-4 py-2 border border-brand bg-paper dark:bg-ink text-brand text-[11px] tracking-[0.1em] uppercase font-medium cursor-not-allowed opacity-60 transition-all duration-200 font-[inherit]'

export default function KeyInput() {
  const [key, setKey] = useState('')
  const [mode, setMode] = useState<'safe' | 'room'>('safe')
  const [hash, setHash] = useState('')
  const [pageState, setPageState] = useState<PageState>('input')
  const [expiry, setExpiry] = useState<'1h' | '24h' | '7d'>('24h')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [visible, setVisible] = useState(true)

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
    const t = setTimeout(() => setSloganReady(true), 100)
    return () => clearTimeout(t)
  }, [])

  async function fade(next: PageState, setup?: () => void) {
    setVisible(false)
    await new Promise((r) => setTimeout(r, 150))
    setError('')
    setup?.()
    setPageState(next)
    setVisible(true)
  }

  async function handleKeySubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!key.trim()) return
    const h = await hashKey(key)
    setHash(h)
    await fade('checking')

    const res = await fetch(`/api/check/${h}?mode=${mode}`)
    const data = await res.json()

    if (!data.exists) {
      await fade('founder', () => setPin(''))
    } else if (data.hasPin) {
      await fade('pin-entry', () => setPin(''))
    } else {
      router.push(`/${mode}/${h}`)
    }
  }

  async function handlePinSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!pin) return
    const res = await fetch('/api/verify-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hash, mode, pin }),
    })
    const data = await res.json()
    if (data.valid) {
      router.push(`/${mode}/${hash}`)
    } else {
      setPageState('wrong-pin')
      setError('WRONG PIN — TRY AGAIN')
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hash, mode, expiry, pin: pin || undefined }),
    })
    const data = await res.json()
    if (data.success) {
      router.push(`/${mode}/${hash}`)
    } else {
      setError('FAILED TO CREATE — TRY AGAIN')
    }
  }

  const hasKey = key.trim().length > 0

  return (
    <div className="flex flex-col gap-4 w-full max-w-sm px-4">
      {/* Title — always visible */}
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
        <p
          style={{
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
          }}
        >
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

      {/* State-based form — fades between states */}
      <div style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.15s ease' }}>

        {/* INPUT */}
        {pageState === 'input' && (
          <form onSubmit={handleKeySubmit} className="flex flex-col gap-4">
            <div className="border border-ink/10 dark:border-paper/10 flex w-full">
              {(['safe', 'room'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setMode(tab)}
                  className={[
                    'flex-1 py-2 font-[inherit] text-[11px] font-medium tracking-[0.1em] uppercase cursor-pointer transition-all duration-150',
                    mode === tab
                      ? 'bg-ink text-paper dark:bg-paper dark:text-ink'
                      : 'bg-paper dark:bg-ink text-muted',
                  ].join(' ')}
                  style={{ borderRadius: 0 }}
                >
                  {tab === 'safe' ? 'SAFE' : 'ROOM'}
                </button>
              ))}
            </div>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="ENTER YOUR KEY…"
              autoComplete="off"
              className={inputClass}
            />
            <button
              type="submit"
              disabled={!hasKey}
              className={hasKey ? primaryBtn : ghostBtn}
              style={{ borderRadius: 0 }}
            >
              OPEN {mode === 'safe' ? 'SAFE' : 'ROOM'}
            </button>
          </form>
        )}

        {/* CHECKING */}
        {pageState === 'checking' && (
          <p className="text-[11px] tracking-[0.12em] uppercase text-muted">
            CHECKING...
          </p>
        )}

        {/* PIN ENTRY */}
        {(pageState === 'pin-entry' || pageState === 'wrong-pin') && (
          <form onSubmit={handlePinSubmit} className="flex flex-col gap-4">
            <div>
              <h2 className="text-[11px] tracking-[0.12em] uppercase text-ink dark:text-paper font-medium mb-1">
                THIS KEY IS ACTIVE
              </h2>
              <p className="text-[10px] tracking-[0.12em] uppercase text-muted">
                ENTER PIN TO CONTINUE
              </p>
            </div>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="PIN..."
              maxLength={8}
              autoComplete="off"
              autoFocus
              className={inputClass}
            />
            {error && (
              <p className="text-brand text-[10px] tracking-[0.12em] uppercase">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={!pin}
              className={pin ? primaryBtn : ghostBtn}
              style={{ borderRadius: 0 }}
            >
              ENTER
            </button>
          </form>
        )}

        {/* FOUNDER SETUP */}
        {pageState === 'founder' && (
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div>
              <p className="text-[11px] tracking-[0.12em] uppercase text-ink dark:text-paper font-medium">
                THIS KEY HAS NO ACTIVE {mode.toUpperCase()}
              </p>
              <p className="text-[10px] tracking-[0.12em] uppercase text-muted mt-1">
                YOU ARE THE FIRST IN — SET IT UP
              </p>
            </div>

            {/* Expiry */}
            <div className="flex gap-2">
              {(['1h', '24h', '7d'] as const).map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setExpiry(e)}
                  className={[
                    'flex-1 py-2 text-[11px] tracking-[0.1em] uppercase font-medium transition-all duration-150 font-[inherit]',
                    expiry === e
                      ? 'border border-brand text-brand bg-paper dark:bg-ink'
                      : 'border border-ink/20 dark:border-paper/20 text-muted bg-paper dark:bg-ink',
                  ].join(' ')}
                  style={{ borderRadius: 0 }}
                >
                  {e.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Optional PIN */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] tracking-[0.12em] uppercase text-muted">
                PIN — OPTIONAL
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="LEAVE BLANK TO SKIP..."
                maxLength={8}
                autoComplete="off"
                className={inputClass}
              />
              <p className="text-[9px] tracking-[0.1em] uppercase text-muted opacity-50">
                PIN CANNOT BE RECOVERED. EVER.
              </p>
            </div>

            {error && (
              <p className="text-brand text-[10px] tracking-[0.12em] uppercase">
                {error}
              </p>
            )}

            <button
              type="submit"
              className={primaryBtn}
              style={{ borderRadius: 0 }}
            >
              CREATE
            </button>
          </form>
        )}

      </div>
    </div>
  )
}
