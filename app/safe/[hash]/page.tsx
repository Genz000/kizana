'use client'

import { useEffect, useState } from 'react'
import { deriveKey } from '@/lib/crypto'
import SafeItems from '@/components/SafeItems'

interface Props {
  params: { hash: string }
}

export default function SafePage({ params }: Props) {
  const { hash } = params
  const [derivedKey, setDerivedKey] = useState<CryptoKey | null>(null)

  useEffect(() => {
    const rawKey = sessionStorage.getItem('kizana_raw_key')
    if (!rawKey) return
    deriveKey(rawKey, hash).then((key) => {
      setDerivedKey(key)
    })
  }, [hash])

  return (
    <main className="min-h-screen bg-paper dark:bg-ink">
      <SafeItems hash={hash} derivedKey={derivedKey} />
    </main>
  )
}
