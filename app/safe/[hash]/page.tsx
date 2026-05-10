import SafeItems from '@/components/SafeItems'

interface Props {
  params: { hash: string }
}

export default function SafePage({ params }: Props) {
  return (
    <main className="min-h-screen bg-paper dark:bg-ink">
      <SafeItems hash={params.hash} />
    </main>
  )
}
