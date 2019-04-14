import { ApolloServer } from 'apollo-server-express'
import express from 'express'
import { importSchema } from 'graphql-import'
import { makeExecutableSchema } from 'graphql-tools'
import databaseConnect from './src/config/database'
import resolvers from './src/resolvers'
import console from './src/utils/log'

const { NODE_ENV } = process.env
const typeDefs = importSchema('./src/schema/schema.graphql')
const schema = makeExecutableSchema({ typeDefs, resolvers })

const server = new ApolloServer({ schema })
const app = express()

server.applyMiddleware({ app })

const startServer = async () => {
  await databaseConnect()
  app.listen({ port: 4000 }, () => console.rainbow(`Server ready at http://localhost:4000${server.graphqlPath}`)) //🌈
}

if (NODE_ENV !== 'test') {
  startServer()
}

export default { startServer }
