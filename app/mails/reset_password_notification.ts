import { BaseMail } from '@adonisjs/mail'

export default class ResetPasswordNotification extends BaseMail {
  subject = 'Redefinição de palavra-passe'

  constructor(
    protected email: string,
    protected url: string
  ) {
    super()
  }

  prepare() {
    this.message
      .to(this.email)
      .htmlView('emails/reset_password', { email: this.email, url: this.url })
  }
}
