'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Toggle theme"
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        width: '36px',
        height: '20px',
        background: 'none',
        border: '1px solid currentColor',
        borderRadius: 0,
        cursor: 'pointer',
        padding: '3px',
        opacity: 0.45,
        color: 'inherit',
        transition: 'opacity 0.15s ease',
        flexShrink: 0,
      }}
      onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
      onMouseLeave={e => (e.currentTarget.style.opacity = '0.45')}
    >
      <span
        style={{
          display: 'block',
          width: '12px',
          height: '12px',
          background: 'currentColor',
          borderRadius: 0,
          transform: isDark ? 'translateX(16px)' : 'translateX(0)',
          transition: 'transform 0.2s ease',
          flexShrink: 0,
        }}
      />
    </button>
  )
}
