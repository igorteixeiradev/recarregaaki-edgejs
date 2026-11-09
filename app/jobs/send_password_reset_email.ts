import { inject } from '@adonisjs/core'
import mail from '@adonisjs/mail/services/main'
import { Job } from '@adonisjs/queue'
import type { JobOptions } from '@adonisjs/queue/types'
import { urlFor } from '@adonisjs/core/services/url_builder'
import env from '#start/env'
import UserService from '#services/user_service'
import VerificationTokenService from '#services/verification_token_service'
import ResetPasswordNotification from '#mails/reset_password_notification'
import { VerificationTokenType } from '#enums/verification_token_type'

type Payload = { email: string }

@inject()
export default class SendPasswordResetEmail extends Job<Payload> {
  static options: JobOptions = { queue: 'default', maxRetries: 3 }

  constructor(
    protected users: UserService,
    protected tokens: VerificationTokenService
  ) {
    super()
  }

  async execute() {
    // Sem erro se o email não existir: quem pediu não deve poder descobrir isso
    const user = await this.users.findByEmail(this.payload.email)
    if (!user) return

    const token = await this.tokens.issue(user.email, VerificationTokenType.PasswordReset)
    const url = urlFor('auth.reset-password.view', [], {
      qs: { token },
      prefixUrl: env.get('APP_URL'),
    })

    await mail.send(new ResetPasswordNotification(user.email, url))
  }
}
