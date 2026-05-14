import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: { hash: string } },
) {
  try {
    const redis = (await import('@/lib/redis')).default
    const raw = await redis.get(`safe:${params.hash}:items`)
    const items = raw ? JSON.parse(raw) : []
    return NextResponse.json({ items })
  } catch {
    return NextResponse.json({ items: [] })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { hash: string } },
) {
  try {
    const { item } = await req.json()
    const redis = (await import('@/lib/redis')).default
    const raw = await redis.get(`safe:${params.hash}:items`)
    const items = raw ? JSON.parse(raw) : []
    items.push(item)
    const ttl = await redis.ttl(`safe:${params.hash}`)
    if (ttl > 0) {
      await redis.set(`safe:${params.hash}:items`, JSON.stringify(items), 'EX', ttl)
    } else {
      await redis.set(`safe:${params.hash}:items`, JSON.stringify(items))
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
