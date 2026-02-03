import { Job } from 'adonisjs-jobs'
import env from '#start/env'
import mail from '@adonisjs/mail/services/main'
import { randomBytes } from 'node:crypto'
import { DateTime } from 'luxon'
import VerificationToken from '#models/verification_token'
type SendEmailResetPasswordPayload = { email: string }

export default class SendEmailResetPassword extends Job {
  async handle(payload: SendEmailResetPasswordPayload) {
    const token = randomBytes(32).toString('hex')
    await VerificationToken.query().where('email', payload.email).delete()
    await VerificationToken.create({
      email: payload.email,
      token,
      expiresAt: DateTime.now().plus({ hours: 1 }),
    })
    await mail.sendLater((message) => {
      message
        .to(payload.email)
        .subject('Recuperação de palavra-passe')
        .htmlView('emails/reset_password', {
          url:
            env.get('NODE_ENV') === 'production'
              ? `https://${env.get('HOST')}/resetar-palavra-passe?token=${token}`
              : `http://${env.get('HOST')}:${env.get('PORT')}/resetar-palavra-passe?token=${token}`,
          email: payload.email,
        })
    })
    this.logger.info('SendEmailResetPassword job handled')
  }
}
