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
    <LetterGlitch
      glitchColors={isDark
        ? ['#606060', '#999999', '#ff6226']
        : ['#c8c7c3', '#999999', '#ff6226']
      }
      bgColor={isDark ? '#0a0a0a' : '#f2f1ee'}
      glitchSpeed={10}
      centerVignette
      outerVignette={false}
      smooth
    />
  )
}
