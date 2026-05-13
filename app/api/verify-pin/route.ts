import { NextRequest, NextResponse } from 'next/server'
import redis from '@/lib/redis'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const { hash, mode, pin } = await req.json()
  const raw = await redis.get(`${mode}:${hash}`)
  if (!raw) return NextResponse.json({ valid: false })
  const data = JSON.parse(raw)
  if (!data.pinHash) return NextResponse.json({ valid: false })
  const valid = await bcrypt.compare(pin, data.pinHash)
  return NextResponse.json({ valid })
}
