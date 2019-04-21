// Create a Transport instance using nodemailer
import nodemailer from 'nodemailer'

export default (userMail: string, subject: string, template: string) => {
  let smtpTransport = nodemailer.createTransport('SMTP', {
    service: 'Gmail',
    auth: {
      XOAuth2: {
        user: process.env.MAIL_USER, // Your gmail address.
        clientId: process.env.MAIL_CLIENT_ID,
        clientSecret: process.env.MAIL_CLIENT_SECRET,
        refreshToken: process.env.MAIL_REFRESH_TOKEN
      }
    }
  })

  // Setup mail configuration
  let mailOptions = {
    from: process.env.MAIL_USER, // sender address
    to: userMail, // list of receivers
    subject, // Subject line
    html: template
  }

  let callback = (error: any, info: any) => {
    if (error) {
      console.log(error.message)

      return false
    }

    return true
  }

  // send mail
  smtpTransport.sendMail(mailOptions, callback)
}
