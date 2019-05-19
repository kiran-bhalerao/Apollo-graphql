import asyncRedis from 'async-redis'

let { REDIS_HOST } = process.env
REDIS_HOST = REDIS_HOST || 'localhost'

const client = asyncRedis.createClient({
  host: REDIS_HOST
})

client.on('error', (err: any) => {
  console.log(`Something went wrong ${err.message}`)
})

export default client
