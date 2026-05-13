'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import LetterGlitch from './LetterGlitch'

export default function GlitchBackground() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null

  const isDark = resolvedTheme === 'dark'

  return (
    <>
      <LetterGlitch
        glitchColors={isDark
          ? ['#606060', '#999999', '#ff6226']
          : ['#c8c7c3', '#999999', '#ff6226']
        }
        bgColor={isDark ? '#0a0a0a' : '#f2f1ee'}
        glitchSpeed={10}
        centerVignette={false}
        outerVignette={false}
        smooth
      />
      {!isDark && (
        <div style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(circle, rgba(242,241,238,0.95) 0%, rgba(242,241,238,0.6) 40%, rgba(242,241,238,0) 75%)',
        }} />
      )}
    </>
  )
}
