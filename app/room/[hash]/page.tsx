'use client'

import { useRouter } from 'next/navigation'
import ChatBox from '@/components/ChatBox'
import { SafeHeader } from '@/components/SafeHeader'

interface Props {
  params: { hash: string }
}

export default function RoomPage({ params }: Props) {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-paper dark:bg-ink">
      <SafeHeader
        mode="ROOM"
        hash={params.hash}
        onLogout={() => {
          sessionStorage.removeItem('kizana_raw_key')
          router.push('/')
        }}
      />
      <ChatBox hash={params.hash} />
    </main>
  )
}
