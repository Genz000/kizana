'use client'

import { useEffect, useState } from 'react'

interface Props {
  label?: string
  done?: boolean
}

export default function LoadingBar({ label = 'CREATING', done = false }: Props) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const steps = [
      { target: 15, duration: 200 },
      { target: 35, duration: 300 },
      { target: 55, duration: 400 },
      { target: 72, duration: 600 },
      { target: 85, duration: 800 },
      { target: 93, duration: 1200 },
      { target: 97, duration: 2000 },
    ]

    let current = 0
    let intervalId: ReturnType<typeof setInterval> | null = null

    const runStep = (index: number) => {
      if (index >= steps.length) return
      const { target, duration } = steps[index]
      const step = (target - current) / (duration / 16)

      intervalId = setInterval(() => {
        current += step
        if (current >= target) {
          current = target
          clearInterval(intervalId!)
          runStep(index + 1)
        }
        setProgress(Math.round(current))
      }, 16)
    }

    runStep(0)
    return () => { if (intervalId) clearInterval(intervalId) }
  }, [])

  useEffect(() => {
    if (done) setProgress(100)
  }, [done])

  return (
    <div style={{ width: '100%' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px',
        fontFamily: 'var(--font-martian-mono), monospace',
        fontSize: '10px',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: '#888780',
      }}>
        <span>{label}...</span>
        <span style={{ color: '#FF4A00' }}>{progress}%</span>
      </div>

      <div style={{
        width: '100%',
        height: '1px',
        background: 'rgba(136,135,128,0.2)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          height: '100%',
          width: `${progress}%`,
          background: '#FF4A00',
          transition: 'width 0.016s linear',
        }} />
      </div>
    </div>
  )
}
