import bcrypt from 'bcryptjs'

export default (password: string) => bcrypt.hash(password, 10)
