'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface DecryptedTextProps {
  text: string
  speed?: number
  maxIterations?: number
  sequential?: boolean
  revealDirection?: 'start' | 'end' | 'center'
  useOriginalCharsOnly?: boolean
  characters?: string
  className?: string
  parentClassName?: string
  encryptedClassName?: string
  animateOn?: 'view' | 'hover'
}

export default function DecryptedText({
  text,
  speed = 50,
  maxIterations = 10,
  sequential = false,
  revealDirection = 'start',
  useOriginalCharsOnly = false,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+',
  className = '',
  parentClassName = '',
  encryptedClassName = '',
  animateOn = 'hover',
}: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState(text)
  const [isHovering, setIsHovering] = useState(false)
  const [isScrambling, setIsScrambling] = useState(false)
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set())
  const [hasAnimated, setHasAnimated] = useState(false)
  const containerRef = useRef<HTMLSpanElement>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const iterationRef = useRef(0)

  const getNextIndex = useCallback(
    (revealedSet: Set<number>): number => {
      const len = text.length
      switch (revealDirection) {
        case 'start':
          return revealedSet.size
        case 'end':
          return len - 1 - revealedSet.size
        case 'center': {
          const mid = Math.floor(len / 2)
          const offset = Math.floor(revealedSet.size / 2)
          const idx = revealedSet.size % 2 === 0 ? mid + offset : mid - offset - 1
          if (idx >= 0 && idx < len && !revealedSet.has(idx)) return idx
          for (let i = 0; i < len; i++) if (!revealedSet.has(i)) return i
          return 0
        }
      }
    },
    [text.length, revealDirection]
  )

  const charPool = useOriginalCharsOnly
    ? Array.from(new Set(text.replace(/ /g, '').split('')))
    : characters.split('')

  const scrambleText = useCallback(
    (revealed: Set<number>) =>
      text
        .split('')
        .map((char, i) => {
          if (char === ' ') return ' '
          if (revealed.has(i)) return char
          return charPool[Math.floor(Math.random() * charPool.length)]
        })
        .join(''),
    [text, charPool]
  )

  const startAnimation = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    iterationRef.current = 0
    setIsScrambling(true)
    setRevealedIndices(new Set())

    if (sequential) {
      const revealed = new Set<number>()
      intervalRef.current = setInterval(() => {
        if (revealed.size < text.length) {
          const idx = getNextIndex(revealed)
          revealed.add(idx)
          setRevealedIndices(new Set(revealed))
          setDisplayText(scrambleText(revealed))
        } else {
          clearInterval(intervalRef.current!)
          setDisplayText(text)
          setIsScrambling(false)
        }
      }, speed)
    } else {
      intervalRef.current = setInterval(() => {
        if (iterationRef.current < maxIterations) {
          setDisplayText(scrambleText(new Set()))
          iterationRef.current++
        } else {
          clearInterval(intervalRef.current!)
          setDisplayText(text)
          setIsScrambling(false)
        }
      }, speed)
    }
  }, [text, sequential, speed, maxIterations, getNextIndex, scrambleText])

  useEffect(() => {
    if (animateOn !== 'view') return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          startAnimation()
        }
      },
      { threshold: 0.1 }
    )
    const el = containerRef.current
    if (el) observer.observe(el)
    return () => { if (el) observer.unobserve(el) }
  }, [animateOn, hasAnimated, startAnimation])

  useEffect(() => {
    if (animateOn !== 'hover') return
    if (isHovering) {
      startAnimation()
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
      setDisplayText(text)
      setIsScrambling(false)
      setRevealedIndices(new Set())
    }
  }, [isHovering, animateOn, startAnimation, text])

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current) }, [])

  useEffect(() => { setDisplayText(text) }, [text])

  return (
    <span
      ref={containerRef}
      className={`inline-block ${parentClassName}`}
      onMouseEnter={() => animateOn === 'hover' && setIsHovering(true)}
      onMouseLeave={() => animateOn === 'hover' && setIsHovering(false)}
    >
      <span aria-label={text} aria-live="polite">
        {displayText.split('').map((char, i) => (
          <span
            key={i}
            className={revealedIndices.has(i) || !isScrambling ? className : encryptedClassName}
          >
            {char}
          </span>
        ))}
      </span>
    </span>
  )
}
