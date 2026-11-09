import { BaseMail } from '@adonisjs/mail'

export default class VerifyEmailNotification extends BaseMail {
  subject = 'Verificação de e-mail'

  constructor(
    protected email: string,
    protected url: string
  ) {
    super()
  }

  prepare() {
    this.message
      .to(this.email)
      .htmlView('emails/verify_email', { email: this.email, url: this.url })
  }
}
