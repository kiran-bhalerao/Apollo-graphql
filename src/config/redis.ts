import asyncRedis from 'async-redis'
const client = asyncRedis.createClient()

client.on('error', (err: any) => {
  console.log(`Something went wrong ${err.message}`)
})

export default client
