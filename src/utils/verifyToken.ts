import jwt from 'jwt-simple'
const verifyToken = (token: string) => {
  // return !!jwt.decode(token, process.env.JWT_SECRET)

  try {
    const decoded = jwt.decode(token, process.env.JWT_SECRET)

    return true
  } catch {}

  return false
}

export default verifyToken
