'use client'

import { useState } from 'react'
import type { SafeItem } from '@/types'
import { encrypt, decrypt } from '@/lib/crypto'

interface Props {
  hash: string
}

export default function SafeItems({ hash }: Props) {
  const [items, setItems] = useState<SafeItem[]>([])
  const [label, setLabel] = useState('')
  const [value, setValue] = useState('')

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!label.trim() || !value.trim()) return
    const item: SafeItem = {
      id: crypto.randomUUID(),
      label: label.trim(),
      value: value.trim(),
      createdAt: Date.now(),
    }
    setItems((prev) => [...prev, item])
    setLabel('')
    setValue('')
  }

  return (
    <div className="max-w-lg mx-auto p-8">
      <h1 className="text-xl font-medium text-ink dark:text-paper mb-1">Safe</h1>
      <p className="text-xs text-muted mb-6 font-mono">{hash.slice(0, 16)}…</p>

      <form onSubmit={handleAdd} className="flex flex-col gap-2 mb-8">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label"
          className="border border-dim bg-transparent px-3 py-2 text-sm text-ink dark:text-paper placeholder:text-muted focus:outline-none focus:border-brand transition-colors"
        />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Secret value"
          type="password"
          autoComplete="off"
          className="border border-dim bg-transparent px-3 py-2 text-sm text-ink dark:text-paper placeholder:text-muted focus:outline-none focus:border-brand transition-colors"
        />
        <button
          type="submit"
          className="bg-brand text-white px-4 py-2 text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
          disabled={!label.trim() || !value.trim()}
        >
          Add item
        </button>
      </form>

      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className="border border-dim px-3 py-2 flex items-center justify-between gap-4">
            <span className="text-sm text-ink dark:text-paper">{item.label}</span>
            <span className="text-xs text-muted font-mono">••••••••</span>
          </li>
        ))}
        {items.length === 0 && (
          <li className="text-sm text-muted text-center py-4">No items yet.</li>
        )}
      </ul>
    </div>
  )
}
