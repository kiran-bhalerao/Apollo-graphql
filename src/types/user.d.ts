import * as mongoose from 'mongoose'

export interface IUser extends mongoose.Document {
  email: string
  username: string
  password: string
}
