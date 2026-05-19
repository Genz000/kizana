'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { hashKey } from '@/lib/hashKey'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import DecryptedText from './DecryptedText'
import LoadingBar from './LoadingBar'

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
  const [expiry, setExpiry] = useState<'1h' | '24h' | '7d' | '1m' | '4m'>('7d')
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createDone, setCreateDone] = useState(false)
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
    setShowKey(false)
    setShowPin(false)
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

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)
      const res = await fetch(`/api/check/${h}?mode=${mode}`, { signal: controller.signal })
      clearTimeout(timeout)

      if (!res.ok) throw new Error()
      const data = await res.json()

      if (!data.exists) {
        await fade('founder', () => setPin(''))
      } else if (data.hasPin) {
        await fade('pin-entry', () => setPin(''))
      } else {
        sessionStorage.setItem('kizana_raw_key', key)
        router.push(`/${mode}/${h}`)
      }
    } catch {
      await fade('founder', () => setPin(''))
    }
  }

  async function handlePinSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!pin) return
    try {
      const res = await fetch('/api/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hash, mode, pin }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      if (data.valid) {
        sessionStorage.setItem('kizana_raw_key', key)
        router.push(`/${mode}/${hash}`)
      } else {
        setPageState('wrong-pin')
        setError('WRONG PIN — TRY AGAIN')
      }
    } catch {
      setError('CONNECTION ERROR — TRY AGAIN')
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setCreateDone(false)
    setError('')
    await new Promise((r) => setTimeout(r, 50))

    try {
      console.log('creating:', { hash, expiry, pin: !!pin, mode })
      const res = await fetch('/api/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hash, mode, expiry, pin: pin || undefined }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      if (data.success) {
        setCreateDone(true)
        sessionStorage.setItem('kizana_raw_key', key)
        await new Promise((r) => setTimeout(r, 300))
        router.push(`/${mode}/${hash}`)
      } else {
        setCreating(false)
        setError('FAILED TO CREATE — TRY AGAIN')
      }
    } catch {
      setCreating(false)
      setError('FAILED TO CREATE — TRY AGAIN')
    }
  }

  function switchMode(next: 'safe' | 'room') {
    setMode(next)
    setExpiry(next === 'safe' ? '7d' : '24h')
  }

  const hasKey = key.trim().length > 0

  if (pageState === 'checking') return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 10,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0px',
    }}>
      <div style={{ width: '200px', height: '200px' }}>
        <DotLottieReact
          src="https://lottie.host/bef8197d-8e56-4584-ae33-3215dc0a06f2/B8wPZGgFvN.lottie"
          loop
          autoplay
        />
      </div>
      <p style={{
        fontFamily: 'var(--font-geist-mono)',
        fontSize: '10px',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: '#888780',
        margin: 0,
      }}>
        CHECKING
      </p>
    </div>
  )

  return (
    <div className="flex flex-col gap-4 px-4"
        style={{ width: '480px', minWidth: '480px' }}>
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
            textIndent: '-1px',
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
            fontSize: '12px',
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
                  onClick={() => switchMode(tab)}
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
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type={showKey ? 'text' : 'password'}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="ENTER YOUR KEY…"
                autoComplete="off"
                className={inputClass}
                style={{ paddingRight: '52px' }}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: '#888780',
                  fontSize: '11px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  fontFamily: 'inherit',
                }}
              >
                {showKey ? 'HIDE' : 'SHOW'}
              </button>
            </div>
            <div style={{ marginTop: '1.25rem' }}>
              <button
                type="submit"
                disabled={!hasKey}
                className={hasKey ? primaryBtn : ghostBtn}
                style={{ borderRadius: 0 }}
              >
                OPEN {mode === 'safe' ? 'SAFE' : 'ROOM'}
              </button>
            </div>
          </form>
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
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="PIN..."
                maxLength={8}
                autoComplete="off"
                autoFocus
                className={inputClass}
                style={{ paddingRight: '52px' }}
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: '#888780',
                  fontSize: '11px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  fontFamily: 'inherit',
                }}
              >
                {showPin ? 'HIDE' : 'SHOW'}
              </button>
            </div>
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
              {(mode === 'safe'
                ? ([['7d', '7 DAYS'], ['1m', '1 MONTH'], ['4m', '4 MONTHS']] as const)
                : ([['1h', '1H'], ['24h', '24H'], ['7d', '7D']] as const)
              ).map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setExpiry(val)}
                  className={[
                    'flex-1 py-2 text-[11px] tracking-[0.1em] uppercase font-medium transition-all duration-150 font-[inherit]',
                    expiry === val
                      ? 'border border-brand text-brand bg-paper dark:bg-ink'
                      : 'border border-ink/20 dark:border-paper/20 text-muted bg-paper dark:bg-ink',
                  ].join(' ')}
                  style={{ borderRadius: 0 }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Optional PIN */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] tracking-[0.12em] uppercase text-muted">
                PIN — OPTIONAL
              </label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="LEAVE BLANK TO SKIP..."
                  maxLength={8}
                  autoComplete="off"
                  className={inputClass}
                  style={{ paddingRight: '52px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    color: '#888780',
                    fontSize: '11px',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontFamily: 'inherit',
                  }}
                >
                  {showPin ? 'HIDE' : 'SHOW'}
                </button>
              </div>
              <p className="text-[9px] tracking-[0.1em] uppercase text-muted opacity-50">
                PIN CANNOT BE RECOVERED. EVER.
              </p>
            </div>

            {error && (
              <p className="text-brand text-[10px] tracking-[0.12em] uppercase">
                {error}
              </p>
            )}

            {creating ? (
              <LoadingBar
                label={mode === 'safe' ? 'CREATING SAFE' : 'CREATING ROOM'}
                done={createDone}
              />
            ) : (
              <button
                type="submit"
                className={primaryBtn}
                style={{ borderRadius: 0 }}
              >
                CREATE
              </button>
            )}
          </form>
        )}

      </div>
    </div>
  )
}
