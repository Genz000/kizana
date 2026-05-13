import Redis from 'ioredis'

declare global {
  var _redis: Redis | undefined
}

const redis = global._redis ?? new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379')

if (process.env.NODE_ENV !== 'production') {
  global._redis = redis
}

export default redis
