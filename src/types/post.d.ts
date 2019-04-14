import * as mongoose from 'mongoose'
export interface IPost extends mongoose.Document {
  title: string
  description: string
  author: string
  createdAt: Date
  updatedAt: Date
}
