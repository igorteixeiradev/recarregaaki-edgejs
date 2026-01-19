import User from '#models/user'
import { CreateEmailPayload, CreatePasswordPayload } from '#validators/auth'
import PasswordResetToken from '#models/password_reset_token'
import { randomBytes } from 'node:crypto'
import { DateTime } from 'luxon'
import logger from '@adonisjs/core/services/logger'
import SendEmailResetPassword from '#jobs/send_email_reset_password'

export class AuthService {
  async forgotPassword(payload: CreateEmailPayload) {
    const { email } = payload
    const token = randomBytes(32).toString('hex')
    await PasswordResetToken.query().where('email', email).delete()
    await PasswordResetToken.create({
      email,
      token,
      expiresAt: DateTime.now().plus({ hours: 1 }),
    })

    await SendEmailResetPassword.dispatch({ email, token }, { queueName: 'mail' })

    logger.info('Password reset email sent to ' + email)
  }

  async resetPassword(payload: CreatePasswordPayload) {
    const { password, token } = payload
    const reset = await PasswordResetToken.query()
      .where('token', token)
      .where('expiresAt', '>', DateTime.now().toSQL())
      .first()

    if (!reset) return false
    const user = await User.findByOrFail('email', reset.email)
    user.password = password
    await user.save()
    logger.info(`${reset.email} update password`)
    await reset.delete()
    logger.info('Password reset successful for ' + user.email)
    return true
  }
}
