import User from '../models/user'

export default (app: any, redisClient: any) => {
  app.get('/forgate/password/:id', async (req: any, res: any) => {
    const { id } = req.params
    const userId = await redisClient.get(id)
    const user: any = await User.findById(userId)

    if (!user) {
      return res.status(406).send({ message: 'Invalid request' })
    }

    const username = user.username
    const link = `${process.env.BASE_URL}/update/password/${id}`

    res.render('password', { username, link })
  })

  app.post('/update/password/:id', async (req: any, res: any) => {
    const { id } = req.params
    const { password, confirmPassword } = req.body

    if (password !== confirmPassword) {
      return res.send({ message: 'Invalid confirm password' })
    }

    const userId = await redisClient.get(id)
    User.findByIdAndUpdate(userId, { password }, { new: true })
      .then(() => res.send('Password updated successfully'))
      .catch((e: any) => res.send({ ...e }))
  })
}
