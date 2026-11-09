import { inject } from '@adonisjs/core'
import mail from '@adonisjs/mail/services/main'
import { Job } from '@adonisjs/queue'
import type { JobOptions } from '@adonisjs/queue/types'
import { urlFor } from '@adonisjs/core/services/url_builder'
import env from '#start/env'
import UserService from '#services/user_service'
import VerificationTokenService from '#services/verification_token_service'
import VerifyEmailNotification from '#mails/verify_email_notification'
import { VerificationTokenType } from '#enums/verification_token_type'

type Payload = { email: string }

@inject()
export default class SendVerificationEmail extends Job<Payload> {
  static options: JobOptions = { queue: 'default', maxRetries: 3 }

  constructor(
    protected users: UserService,
    protected tokens: VerificationTokenService
  ) {
    super()
  }

  async execute() {
    const user = await this.users.findByEmail(this.payload.email)
    if (!user || user.isEmailVerified) return

    const token = await this.tokens.issue(user.email, VerificationTokenType.EmailVerification)
    const url = urlFor('auth.verifyEmail', [], { qs: { token }, prefixUrl: env.get('APP_URL') })

    await mail.send(new VerifyEmailNotification(user.email, url))
  }
}
