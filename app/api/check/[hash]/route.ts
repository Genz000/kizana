import { NextRequest, NextResponse } from 'next/server'
import redis from '@/lib/redis'

export async function GET(
  req: NextRequest,
  { params }: { params: { hash: string } },
) {
  const mode = req.nextUrl.searchParams.get('mode') ?? 'safe'
  const raw = await redis.get(`${mode}:${params.hash}`)
  if (!raw) return NextResponse.json({ exists: false, hasPin: false })
  const data = JSON.parse(raw)
  return NextResponse.json({ exists: true, hasPin: !!data.pinHash })
}
