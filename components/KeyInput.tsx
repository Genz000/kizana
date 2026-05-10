'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { hashKey } from '@/lib/hashKey'

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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm px-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode('safe')}
          className={`flex-1 py-1 text-sm border transition-colors ${
            mode === 'safe'
              ? 'border-brand text-brand'
              : 'border-dim text-muted hover:border-muted'
          }`}
        >
          Safe
        </button>
        <button
          type="button"
          onClick={() => setMode('room')}
          className={`flex-1 py-1 text-sm border transition-colors ${
            mode === 'room'
              ? 'border-brand text-brand'
              : 'border-dim text-muted hover:border-muted'
          }`}
        >
          Room
        </button>
      </div>
      <input
        type="password"
        value={key}
        onChange={(e) => setKey(e.target.value)}
        placeholder="Enter your key…"
        autoComplete="off"
        className="border border-dim bg-transparent px-3 py-2 text-ink dark:text-paper placeholder:text-muted focus:outline-none focus:border-brand transition-colors"
      />
      <button
        type="submit"
        className="bg-brand text-white px-4 py-2 hover:opacity-90 transition-opacity disabled:opacity-40"
        disabled={!key.trim()}
      >
        Open {mode === 'safe' ? 'Safe' : 'Room'}
      </button>
    </form>
  )
}
