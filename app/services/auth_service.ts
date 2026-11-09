import { inject } from '@adonisjs/core'
import type User from '#models/user'
import SendPasswordResetEmail from '#jobs/send_password_reset_email'
import SendVerificationEmail from '#jobs/send_verification_email'
import UserService from '#services/user_service'
import VerificationTokenService from '#services/verification_token_service'
import { VerificationTokenType } from '#enums/verification_token_type'
import type { RegisterPayload } from '#validators/auth'

@inject()
export default class AuthService {
  constructor(
    protected users: UserService,
    protected tokens: VerificationTokenService
  ) {}

  async register(data: RegisterPayload): Promise<User> {
    const user = await this.users.create({ ...data, isAdmin: false })
    await SendVerificationEmail.dispatch({ email: user.email })
    return user
  }

  /**
   * Devolve `false` se o email já estava verificado (nada a enviar).
   */
  async resendVerificationEmail(user: User): Promise<boolean> {
    if (user.isEmailVerified) return false

    await SendVerificationEmail.dispatch({ email: user.email })
    return true
  }

  async verifyEmail(token: string): Promise<boolean> {
    const email = await this.tokens.consume(token, VerificationTokenType.EmailVerification)
    if (!email) return false

    await this.users.markEmailVerified(email)
    return true
  }

  async requestPasswordReset(email: string): Promise<void> {
    await SendPasswordResetEmail.dispatch({ email })
  }

  async resetPassword(token: string, password: string): Promise<boolean> {
    const email = await this.tokens.consume(token, VerificationTokenType.PasswordReset)
    if (!email) return false

    const user = await this.users.findByEmail(email)
    if (!user) return false

    await this.users.changePassword(user, password)
    return true
  }
}
