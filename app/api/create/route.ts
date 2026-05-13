import { NextRequest, NextResponse } from 'next/server'
import redis from '@/lib/redis'
import bcrypt from 'bcryptjs'

const TTL: Record<string, number> = { '1h': 3600, '24h': 86400, '7d': 604800 }

export async function POST(req: NextRequest) {
  const { hash, mode, expiry, pin } = await req.json()
  if (!hash || !mode || !expiry) {
    return NextResponse.json({ success: false }, { status: 400 })
  }
  const data: { pinHash?: string } = {}
  if (pin) data.pinHash = await bcrypt.hash(pin, 10)
  const ttl = TTL[expiry] ?? TTL['24h']
  await redis.set(`${mode}:${hash}`, JSON.stringify(data), 'EX', ttl)
  return NextResponse.json({ success: true })
}
