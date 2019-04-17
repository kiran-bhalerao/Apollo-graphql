import jwt from 'jsonwebtoken'
import User from '../models/user'
import * as T from '../types/user'

const { JWT_SECRET } = process.env

export const createTokens = (user: T.IUser) => {
  const REFRESH_SECRET = JWT_SECRET + user.password

  const accessToken = jwt.sign({ sub: user._id }, JWT_SECRET, { expiresIn: '1m' })
  const refreshToken = jwt.sign({ sub: user._id }, REFRESH_SECRET, { expiresIn: '7d' })

  return Promise.all([accessToken, refreshToken])
}

export const refreshTokens = async (refreshToken: string) => {
  let userId = null
  try {
    // decode token without verifying,
    // just get the payload without providing any private key
    const decodedUser: any = jwt.decode(refreshToken)
    userId = decodedUser.sub
  } catch (err) {
    return {}
  }

  if (!userId) {
    return {}
  }

  const user: any = await User.findById(userId)

  if (!user) {
    return {}
  }

  const refreshSecret = JWT_SECRET + user.password

  try {
    // verify token with refreshSecret,
    // if user doent change his password then it will verify correctly
    // if yes it will throw an error b'cause private key doesnt match
    jwt.verify(refreshToken, refreshSecret)
  } catch (err) {
    return {}
  }

  const [newAccessToken, newRefreshToken] = await createTokens(user)

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    user
  }
}
