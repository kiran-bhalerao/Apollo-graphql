import mongoose from 'mongoose'
import Post from '../entity/post/post.model'
import User from '../entity/user/user.model'

mongoose.set('useFindAndModify', false)
mongoose.set('remove', false)

let { MONGO_HOST, DATABASE_NAME, TEST_DATABASE_URL } = process.env

MONGO_HOST = MONGO_HOST || 'localhost'
const DATABASE_URL = TEST_DATABASE_URL || `mongodb://${MONGO_HOST}/${DATABASE_NAME}`

export const connectToDB = async (done = () => {}) => {
  await mongoose.connect(DATABASE_URL, { useNewUrlParser: true })
  done()
}
export const disconnectDB = (done: any) => mongoose.disconnect(done)

export const clearDB = async () => {
  await User.deleteMany({})
  await Post.deleteMany({})
}
