import { NextRequest, NextResponse } from 'next/server'
import type Redis from 'ioredis'

async function getRedisAndItems(hash: string): Promise<{ redis: Redis; items: { id: string }[] }> {
  const redis = (await import('@/lib/redis')).default
  const raw = await redis.get(`safe:${hash}:items`)
  return { redis, items: raw ? JSON.parse(raw) : [] }
}

async function persist(redis: Redis, hash: string, items: unknown[]) {
  const ttl = await redis.ttl(`safe:${hash}`)
  if (ttl > 0) {
    await redis.set(`safe:${hash}:items`, JSON.stringify(items), 'EX', ttl)
  } else {
    await redis.set(`safe:${hash}:items`, JSON.stringify(items))
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { hash: string; id: string } },
) {
  try {
    const { title } = await req.json()
    const { redis, items } = await getRedisAndItems(params.hash)
    const idx = items.findIndex((i) => i.id === params.id)
    if (idx >= 0) (items[idx] as Record<string, unknown>).title = title
    await persist(redis, params.hash, items)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { hash: string; id: string } },
) {
  try {
    const { item } = await req.json()
    const { redis, items } = await getRedisAndItems(params.hash)
    const idx = items.findIndex((i) => i.id === params.id)
    if (idx >= 0) items[idx] = item
    else items.push(item)
    await persist(redis, params.hash, items)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { hash: string; id: string } },
) {
  try {
    const { redis, items } = await getRedisAndItems(params.hash)
    const updated = items.filter((i) => i.id !== params.id)
    await persist(redis, params.hash, updated)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
