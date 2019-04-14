import mongoose from 'mongoose'
mongoose.set('useFindAndModify', false)

export default () => mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true })
