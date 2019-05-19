import { connection, Types } from 'mongoose'
import { clearDB, connectToDB, disconnectDB } from '../../config/database'
import postResolver from '../../entity/post/post.resolver'

describe('Post', () => {
  beforeAll(connectToDB)
  afterAll(disconnectDB)
  afterEach(clearDB)

  describe('Testing Posts Query', () => {
    it('should resolve post query', async () => {
      await connection.collection('posts').insertOne({
        title: 't1',
        description: 'd1',
        type: 'news',
        tags: ['js'],
        author: {
          id: Types.ObjectId,
          username: 'username'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      })
      const result = await postResolver.Query.posts()

      expect(result).toHaveLength(1)
    })
  })
})
