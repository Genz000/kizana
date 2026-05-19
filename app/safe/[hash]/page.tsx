'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { deriveKey, encrypt, decrypt } from '@/lib/crypto'
import { SafeHeader } from '@/components/SafeHeader'
import { timeAgo } from '@/lib/utils'
import type { ItemType, SafeItem, StoredItem } from '@/types'

interface Props {
  params: { hash: string }
}

function formatTtl(seconds: number) {
  if (seconds > 86400) return `${Math.ceil(seconds / 86400)}D`
  if (seconds > 3600) return `${Math.ceil(seconds / 3600)}H`
  return `${Math.ceil(seconds / 60)}M`
}

function detectType(value: string): ItemType {
  const trimmed = value.trim()
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('www.')
  ) return 'LINK'
  if (
    trimmed.startsWith('const ') ||
    trimmed.startsWith('let ') ||
    trimmed.startsWith('function ') ||
    trimmed.startsWith('import ') ||
    trimmed.startsWith('export ') ||
    trimmed.startsWith('npm ') ||
    trimmed.startsWith('git ') ||
    trimmed.startsWith('<') ||
    trimmed.startsWith('$')
  ) return 'CODE'
  return 'NOTE'
}

const ghostBtn: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  fontFamily: 'var(--font-geist-mono)',
  fontSize: '9px',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  opacity: 0.35,
  cursor: 'pointer',
  color: 'inherit',
  padding: 0,
  height: '20px',
  lineHeight: '20px',
}

export default function SafePage({ params }: Props) {
  const { hash } = params
  const [derivedKey, setDerivedKey] = useState<CryptoKey | null>(null)
  const [items, setItems] = useState<SafeItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [copyHover, setCopyHover] = useState(false)
  const [deleteHover, setDeleteHover] = useState(false)
  const [ttl, setTtl] = useState<number | null>(null)

  const saveContentTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const saveTitleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const itemsRef = useRef<SafeItem[]>([])
  const derivedKeyRef = useRef<CryptoKey | null>(null)
  itemsRef.current = items
  derivedKeyRef.current = derivedKey

  const selectedItem = items.find((i) => i.id === selectedId) ?? null

  useEffect(() => {
    const rawKey = sessionStorage.getItem('kizana_raw_key')
    if (!rawKey) return
    let cancelled = false
    deriveKey(rawKey, hash).then((key) => {
      if (!cancelled) setDerivedKey(key)
    })
    return () => { cancelled = true }
  }, [hash])

  useEffect(() => {
    fetch(`/api/check/${hash}?mode=safe`)
      .then((r) => r.json())
      .then((d) => { if (d.ttl > 0) setTtl(d.ttl) })
      .catch(() => {})
  }, [hash])

  useEffect(() => {
    if (!derivedKey) return
    fetch(`/api/safe/${hash}/items`)
      .then((r) => r.json())
      .then(async ({ items: stored }) => {
        const decrypted = await Promise.all(
          (stored as StoredItem[]).map(async (s) => ({
            id: s.id,
            type: s.type,
            title: s.title ?? '',
            value: await decrypt(s.ciphertext, s.iv, derivedKey),
            createdAt: s.createdAt,
          }))
        )
        setItems((prev) => {
          const redisIds = new Set(decrypted.map((i) => i.id))
          const localOnly = prev.filter((i) => !redisIds.has(i.id))
          return localOnly.length === 0 ? decrypted : [...decrypted, ...localOnly]
        })
      })
      .catch(() => {})
  }, [derivedKey, hash])

  useEffect(() => {
    setEditValue(selectedItem?.value ?? '')
    setShowPass(false)
  }, [selectedId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleNewNote = useCallback(async () => {
    const id = crypto.randomUUID()
    const createdAt = Date.now()
    const newItem: SafeItem = { id, type: 'NOTE' as ItemType, title: '', value: '', createdAt, isNew: true }
    setItems((prev) => [newItem, ...prev])
    setSelectedId(id)
    setEditValue('')
    setTimeout(() => {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, isNew: false } : i)))
    }, 3000)
    const key = derivedKeyRef.current
    if (key) {
      const { ciphertext, iv } = await encrypt('', key)
      const stored: StoredItem = { id, type: 'NOTE', ciphertext, iv, createdAt }
      fetch(`/api/safe/${hash}/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: stored }),
      }).catch(() => {})
    }
  }, [hash])

  const handleUpdateItem = useCallback((id: string, value: string) => {
    const detectedType = detectType(value)
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, value, type: detectedType } : i))
    )

    if (saveContentTimeoutRef.current) clearTimeout(saveContentTimeoutRef.current)
    if (!value.trim()) return

    saveContentTimeoutRef.current = setTimeout(async () => {
      const key = derivedKeyRef.current
      if (!key) return
      const item = itemsRef.current.find((i) => i.id === id)
      if (!item) return
      try {
        const { ciphertext, iv } = await encrypt(value, key)
        const stored: StoredItem = {
          id,
          type: detectedType,
          title: item.title,
          ciphertext,
          iv,
          createdAt: item.createdAt,
        }
        await fetch(`/api/safe/${hash}/items/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ item: stored }),
        })
      } catch (e) {
        console.error('update failed:', e)
      }
    }, 600)
  }, [hash])

  const handleUpdateTitle = useCallback((id: string, title: string) => {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, title } : item))
    if (saveTitleTimeoutRef.current) clearTimeout(saveTitleTimeoutRef.current)
    saveTitleTimeoutRef.current = setTimeout(() => {
      fetch(`/api/safe/${hash}/items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      }).catch(() => {})
    }, 800)
  }, [hash])

  const handleDelete = useCallback(
    async (id: string) => {
      setItems((prev) => prev.filter((i) => i.id !== id))
      if (selectedId === id) {
        setSelectedId(null)
        setEditValue('')
      }
      await fetch(`/api/safe/${hash}/items/${id}`, { method: 'DELETE' })
    },
    [hash, selectedId]
  )

  const handleDuplicate = useCallback(async () => {
    if (!selectedItem) return
    const key = derivedKeyRef.current
    if (!key) return
    const id = crypto.randomUUID()
    const createdAt = Date.now()
    const duplicate: SafeItem = {
      id,
      type: selectedItem.type,
      title: selectedItem.title ? `${selectedItem.title} copy` : '',
      value: selectedItem.value,
      createdAt,
    }
    setItems((prev) => [duplicate, ...prev])
    setSelectedId(id)
    setEditValue(duplicate.value)
    const { ciphertext, iv } = await encrypt(duplicate.value, key)
    const stored: StoredItem = { id, type: duplicate.type, ciphertext, iv, createdAt, title: duplicate.title }
    fetch(`/api/safe/${hash}/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item: stored }),
    }).catch(() => {})
  }, [selectedItem, hash])

  return (
    <main
      className="bg-paper dark:bg-ink text-ink dark:text-paper"
      style={{
        display: 'flex',
        height: '100vh',
        paddingTop: '48px',
        overflow: 'hidden',
        fontFamily: 'var(--font-geist-mono)',
      }}
    >
      <SafeHeader
        mode="SAFE"
        hash={hash}
        expiry={ttl ? formatTtl(ttl) : '7D'}
        onLogout={() => {
          sessionStorage.removeItem('kizana_raw_key')
          window.location.href = '/'
        }}
      />

      {/* SIDEBAR */}
      <div
        className="border-r border-ink/[0.15] dark:border-paper/[0.15]"
        style={{
          width: '280px',
          minWidth: '280px',
          minHeight: 0,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* FIX 1 — button + separator */}
        <button
          onClick={handleNewNote}
          disabled={!derivedKey}
          style={{
            width: '100%',
            height: '40px',
            boxSizing: 'border-box',
            padding: '0 16px',
            background: '#FF4A00',
            border: 'none',
            fontFamily: 'var(--font-geist-mono)',
            fontSize: '10px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#ffffff',
            cursor: derivedKey ? 'pointer' : 'wait',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexShrink: 0,
            opacity: derivedKey ? 1 : 0.5,
          }}
        >
          {derivedKey ? '+ NEW SECRET' : 'LOADING…'}
        </button>
        <div className="border-b border-ink/[0.15] dark:border-paper/[0.15]" style={{ flexShrink: 0 }} />

        {/* FIX 2 — item cards with editable title + hover delete */}
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedId(item.id)}
            style={{
              padding: '12px 16px',
              borderBottom: '0.5px solid rgba(10,10,10,0.15)',
              cursor: 'pointer',
              borderLeft: selectedId === item.id
                ? '2px solid #FF4A00'
                : '2px solid transparent',
              background: selectedId === item.id
                ? 'rgba(255,74,0,0.05)'
                : 'transparent',
              position: 'relative',
              overflow: 'hidden',
            }}
            className="dark:[border-bottom-color:rgba(255,255,255,0.15)] hover:bg-ink/[0.02] dark:hover:bg-paper/[0.02]"
          >
            {/* editable title */}
            <input
              value={item.title || ''}
              onChange={(e) => handleUpdateTitle(item.id, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder="UNTITLED"
              className="text-ink dark:text-paper placeholder:text-muted placeholder:opacity-30"
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontFamily: 'var(--font-geist-mono)',
                fontSize: '12px',
                fontWeight: 500,
                opacity: 0.85,
                width: 'calc(100% - 20px)',
                letterSpacing: '0.02em',
                padding: 0,
                marginBottom: '4px',
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            />

            {/* time + type */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{
                fontSize: '9px',
                opacity: 0.25,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                flexShrink: 0,
              }}>
                {timeAgo(item.createdAt)}
              </span>
              <span style={{
                fontSize: '9px',
                opacity: 0.2,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}>
                — {item.type}
              </span>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div style={{
            padding: '20px 16px',
            fontSize: '10px',
            opacity: 0.2,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}>
            NO SECRETS YET
          </div>
        )}
      </div>

      {/* DETAIL PANEL */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {selectedItem ? (
          <>
            {/* toolbar */}
            <div
              className="border-b border-ink/[0.15] dark:border-paper/[0.15]"
              style={{
                height: '40px',
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 24px',
                flexShrink: 0,
              }}
            >
              <input
                value={selectedItem.title || ''}
                onChange={(e) => handleUpdateTitle(selectedItem.id, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                placeholder="UNTITLED"
                className="placeholder:text-muted placeholder:opacity-40"
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontFamily: 'var(--font-geist-mono)',
                  fontSize: '12px',
                  fontWeight: 500,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'inherit',
                  opacity: 0.85,
                  flex: 1,
                  marginRight: '24px',
                  height: '20px',
                  lineHeight: '20px',
                  padding: 0,
                }}
              />
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                {selectedItem.type === 'PASS' && (
                  <button onClick={() => setShowPass((p) => !p)} style={ghostBtn}>
                    {showPass ? 'HIDE' : 'REVEAL'}
                  </button>
                )}
                <button
                  onClick={handleDuplicate}
                  onMouseEnter={() => setCopyHover(true)}
                  onMouseLeave={() => setCopyHover(false)}
                  style={{ ...ghostBtn, opacity: copyHover ? 0.8 : 0.35 }}
                >
                  DUPLICATE
                </button>
                <button
                  onClick={() => handleDelete(selectedItem.id)}
                  onMouseEnter={() => setDeleteHover(true)}
                  onMouseLeave={() => setDeleteHover(false)}
                  style={{ ...ghostBtn, opacity: deleteHover ? 1 : 0.35, color: deleteHover ? '#FF4A00' : 'inherit' }}
                >
                  DELETE
                </button>
              </div>
            </div>

            {/* editable textarea */}
            <textarea
              key={selectedId}
              value={selectedItem.type === 'PASS' && !showPass ? '••••••••' : editValue}
              onChange={(e) => {
                if (selectedItem.type === 'PASS' && !showPass) return
                setEditValue(e.target.value)
                handleUpdateItem(selectedItem.id, e.target.value)
              }}
              autoFocus
              className="text-ink dark:text-paper placeholder:text-muted"
              style={{
                flex: 1,
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontFamily: 'var(--font-geist-mono)',
                fontSize: '14px',
                letterSpacing: '0.03em',
                lineHeight: 1.9,
                opacity: 0.85,
                resize: 'none',
                padding: '24px',
                wordBreak: 'break-word',
              }}
            />
          </>
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '8px',
            opacity: 0.15,
          }}>
            <p style={{
              fontSize: '12px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              margin: 0,
            }}>
              SELECT A SECRET OR CREATE NEW
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
