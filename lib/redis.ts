import { Redis } from '@upstash/redis'

// Windows dev: Node.js can't verify Upstash's TLS cert chain locally
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
}

const upstash = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Thin wrapper matching the ioredis subset used in this project.
// @upstash/redis auto-deserializes JSON on get, so we re-stringify
// objects to keep the existing JSON.parse() calls working.
const redis = {
  async get(key: string): Promise<string | null> {
    const val = await upstash.get(key)
    if (val === null || val === undefined) return null
    if (typeof val === 'string') return val
    return JSON.stringify(val)
  },

  async set(key: string, value: string, exFlag?: 'EX', ttl?: number): Promise<void> {
    if (exFlag === 'EX' && ttl) {
      await upstash.set(key, value, { ex: ttl })
    } else {
      await upstash.set(key, value)
    }
  },

  async ttl(key: string): Promise<number> {
    return upstash.ttl(key)
  },

  async del(key: string): Promise<void> {
    await upstash.del(key)
  },
}

export default redis
