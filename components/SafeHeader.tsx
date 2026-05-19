'use client'

import { useState } from 'react'

interface SafeHeaderProps {
  mode: 'SAFE' | 'ROOM'
  hash: string
  expiry?: string
  onLogout: () => void
}

export const SafeHeader = ({ mode, hash, expiry, onLogout }: SafeHeaderProps) => {
  const [hovered, setHovered] = useState(false)

  return (
  <header
    className="bg-paper dark:bg-ink border-b border-ink/[0.15] dark:border-paper/[0.15]"
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 24px',
      fontFamily: 'var(--font-geist-mono)',
    }}
  >
    {/* logo */}
    <span style={{ fontSize: '11px', letterSpacing: '0.14em', fontWeight: 500 }}>
      kz<span style={{ color: '#FF4A00' }}>.</span>
    </span>

    {/* breadcrumb */}
    <span style={{
      fontSize: '9px',
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      opacity: 0.4,
    }}>
      {mode} / {hash.slice(0, 6)}…
    </span>

    {/* right side */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      {expiry && (
        <span style={{
          fontSize: '9px',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          opacity: 0.4,
        }}>
          EXPIRES IN {expiry}
        </span>
      )}
      <button
        onClick={onLogout}
        aria-label="Leave"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: '28px',
          height: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: hovered ? '#FF4A00' : 'transparent',
          border: '1px solid #FF4A00',
          borderRadius: 0,
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'background 0.15s ease',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 2H2v10h3" stroke={hovered ? '#ffffff' : '#FF4A00'} strokeWidth="1.2" strokeLinecap="square"/>
          <path d="M9 10l3-3-3-3" stroke={hovered ? '#ffffff' : '#FF4A00'} strokeWidth="1.2" strokeLinecap="square" strokeLinejoin="miter"/>
          <line x1="12" y1="7" x2="5" y2="7" stroke={hovered ? '#ffffff' : '#FF4A00'} strokeWidth="1.2" strokeLinecap="square"/>
        </svg>
      </button>
    </div>
  </header>
  )
}
