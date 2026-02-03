import User from '#models/user'
import { CreatePasswordPayload } from '#validators/auth'
import VerificationToken from '#models/verification_token'
import { DateTime } from 'luxon'
import logger from '@adonisjs/core/services/logger'

export class AuthService {
  async resetPassword(payload: CreatePasswordPayload): Promise<boolean> {
    const { password, token } = payload
    const verificationToken = await VerificationToken.query()
      .where('token', token)
      .where('expiresAt', '>', DateTime.now().toSQL())
      .first()

    if (!verificationToken) return false
    const user = await User.findByOrFail('email', verificationToken.email)
    user.password = password
    await user.save()
    logger.info(`${verificationToken.email} update password`)
    await verificationToken.delete()
    logger.info('Password reset successful for ' + user.email)
    return true
  }

  async verifyEmail(payload: { token: string }) {
    const verificationToken = await VerificationToken.query()
      .where('token', payload.token)
      .where('expiresAt', '>', DateTime.now().toSQL())
      .first()

    if (!verificationToken) return false
    const user = await User.findByOrFail('email', verificationToken.email)
    user.isEmailVerified = true
    await user.save()
    logger.info(`${verificationToken.email} email verified`)
    await verificationToken.delete()
    logger.info('Email verification successful for ' + user.email)
    return true
  }
}
