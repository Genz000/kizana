import ChatBox from '@/components/ChatBox'

interface Props {
  params: { hash: string }
}

export default function RoomPage({ params }: Props) {
  return (
    <main className="min-h-screen bg-paper dark:bg-ink">
      <ChatBox hash={params.hash} />
    </main>
  )
}
