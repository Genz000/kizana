import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: { hash: string } },
) {
  try {
    const redis = (await import('@/lib/redis')).default
    const mode = req.nextUrl.searchParams.get('mode') ?? 'safe'
    const raw = await redis.get(`${mode}:${params.hash}`)
    if (!raw) return NextResponse.json({ exists: false, hasPin: false })
    const data = JSON.parse(raw)
    const ttl = await redis.ttl(`${mode}:${params.hash}`)
    return NextResponse.json({ exists: true, hasPin: !!data.pinHash, ttl })
  } catch {
    return NextResponse.json({ exists: false, hasPin: false })
  }
}
