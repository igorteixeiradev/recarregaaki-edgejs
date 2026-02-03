import VerificationToken from '#models/verification_token'
import { Job } from 'adonisjs-jobs'
import { randomBytes } from 'node:crypto'
import { DateTime } from 'luxon'
import env from '#start/env'
import mail from '@adonisjs/mail/services/main'

type SendEmailVerificationPayload = { email: string }

export default class SendEmailVerification extends Job {
  async handle(payload: SendEmailVerificationPayload) {
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
        .subject(' Verificação de e-mail')
        .htmlView('emails/verify_email', {
          url:
            env.get('NODE_ENV') === 'production'
              ? `https://${env.get('HOST')}/verificar-email?token=${token}`
              : `http://${env.get('HOST')}:${env.get('PORT')}/verificar-email?token=${token}`,
          email: payload.email,
        })
    })
    this.logger.info('SendEmailVerification job handled')
  }
}
