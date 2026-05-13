import { NextRequest, NextResponse } from 'next/server'

const TTL: Record<string, number> = {
  '1h': 3600,
  '24h': 86400,
  '7d': 604800,
  '1m': 2592000,
  '4m': 10368000,
}

export async function POST(req: NextRequest) {
  try {
    const { hash, mode, expiry, pin } = await req.json()
    if (!hash || !mode || !expiry) {
      return NextResponse.json({ success: false }, { status: 400 })
    }

    const ttl = TTL[expiry] ?? TTL['24h']
    console.log('create:', { hash, mode, expiry, ttl, hasPin: !!pin })

    try {
      const redis = (await import('@/lib/redis')).default
      const bcrypt = (await import('bcryptjs')).default
      const data: { pinHash?: string } = {}
      if (pin) data.pinHash = await bcrypt.hash(pin, 10)
      await redis.set(`${mode}:${hash}`, JSON.stringify(data), 'EX', ttl)
    } catch (redisErr) {
      console.warn('Redis unavailable, skipping persistence:', redisErr)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('create error:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
