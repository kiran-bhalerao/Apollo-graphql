import jwt from 'jwt-simple'
import User from '../models/user'
import verifyToken from './verifyToken'

const getUser = (token: string = '') => {
  token = token.split(' ')[1] || ''

  try {
    const isVerifiedToken = verifyToken(token)

    if (isVerifiedToken) {
      const _id = jwt.decode(token, process.env.JWT_SECRET)

      return User.findById(_id)
    }
  } catch {
    return null
  }
}

export default getUser
