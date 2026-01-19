import { Job } from 'adonisjs-jobs'
import env from '#start/env'
import mail from '@adonisjs/mail/services/main'

type SendEmailResetPasswordPayload = { email: string; token: string }

export default class SendEmailResetPassword extends Job {
  async handle(payload: SendEmailResetPasswordPayload) {
    const { email, token } = payload
    await mail.sendLater((message) => {
      message
        .to(email)
        .subject('Recuperação de palavra-passe')
        .htmlView('emails/reset_password', {
          url:
            env.get('NODE_ENV') === 'production'
              ? `https://${env.get('HOST')}/resetar-palavra-passe?token=${token}`
              : `http://${env.get('HOST')}:${env.get('PORT')}/resetar-palavra-passe?token=${token}`,
          email,
        })
    })
    this.logger.info('SendEmailResetPassword job handled')
  }
}
