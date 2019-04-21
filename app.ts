import { ApolloServer, PubSub } from 'apollo-server-express'
import bodyParser from 'body-parser'
import express from 'express'
import exphbs from 'express-handlebars'
import { importSchema } from 'graphql-import'
import { makeExecutableSchema } from 'graphql-tools'
import http from 'http'
import jwt from 'jsonwebtoken'
import _ from 'lodash'
import databaseConnect from './src/config/database'
import redisClient from './src/config/redis'
import console from './src/define/logs'
import User from './src/models/user'
import resolvers from './src/resolvers'
import routes from './src/routes'
import { getErrorType } from './src/utils/getErrorType'
import { refreshTokens } from './src/utils/getToken'

const typeDefs = importSchema('./src/schema/schema.graphql')
const { NODE_ENV } = process.env
const pubsub = new PubSub()
const app = express()

// express middleware
app.use(async (req: any, res, next) => {
  const token = req.headers['x-auth-token']
  const refreshToken = req.headers['x-refresh-token']

  if (token && refreshToken) {
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findById(decoded.sub)
      req.user = user
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

// body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// handlebars middleware
app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')
app.set('views', './src/views')

// express routes
routes(app, redisClient)

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
      redisClient,
      user
    }
  },
  formatError: (err: any) => {
    const errorType = getErrorType(err.message)
    const error = _.isEmpty(errorType) ? err : errorType

    return { ...error }
  }
})

// apollo middleware
server.applyMiddleware({ app })

// server connection
const httpServer = http.createServer(app)
server.installSubscriptionHandlers(httpServer)

const startServer = async () => {
  await databaseConnect()
  httpServer.listen({ port: 4000 }, () =>
    console.rainbow(`Server ready at ${process.env.BASE_URL}${server.graphqlPath}`)
  ) //🌈
}

startServer()

export default { startServer }
