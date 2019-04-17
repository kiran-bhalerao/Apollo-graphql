import { ApolloServer, PubSub } from 'apollo-server-express'
import express from 'express'
import { importSchema } from 'graphql-import'
import { makeExecutableSchema } from 'graphql-tools'
import http from 'http'
import jwt from 'jsonwebtoken'
import _ from 'lodash'
import databaseConnect from './src/config/database'
import console from './src/config/logs'
import resolvers from './src/resolvers'
import { getErrorType } from './src/utils/getErrorType'
import { refreshTokens } from './src/utils/getToken'

const { NODE_ENV } = process.env
const POST_CREATED = 'post_created'

const pubsub = new PubSub()
const typeDefs = importSchema('./src/schema/schema.graphql')

const app = express()

app.use(async (req: any, res, next) => {
  const token = req.headers['x-auth-token']
  const refreshToken = req.headers['x-refresh-token']

  if (token && refreshToken) {
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET)
      req.user = decoded.user
    } catch (err) {
      const newTokens = await refreshTokens(refreshToken)
      if (newTokens.accessToken && newTokens.refreshToken) {
        res.set('Access-Control-Expose-Headers', 'x-auth-token, x-refresh-token')
        res.set('x-auth-token', newTokens.accessToken)
        res.set('x-refresh-token', newTokens.refreshToken)
      }
      req.user = newTokens.user
    }
  }
  next()
})

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})

const server = new ApolloServer({
  schema,
  context: ({ req }: { req: any }) => {
    const user = req.user ? _.pick(req.user, ['_id', 'username', 'email', 'posts']) : null

    return {
      pubsub,
      user,
      POST_CREATED
    }
  },
  formatError: ({ message }: { message: string }) => {
    const error = getErrorType(message)

    return { ...error }
  }
})

server.applyMiddleware({ app })

const httpServer = http.createServer(app)
server.installSubscriptionHandlers(httpServer)

const startServer = async () => {
  await databaseConnect()
  httpServer.listen({ port: 4000 }, () => console.rainbow(`Server ready at http://localhost:4000${server.graphqlPath}`)) //🌈
}

if (NODE_ENV !== 'test') {
  startServer()
}

export default { startServer }
