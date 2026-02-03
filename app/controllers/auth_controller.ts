import type { HttpContext } from '@adonisjs/core/http'
import {
  createEmailAndPasswordValidator,
  createEmailValidator,
  createPasswordValidator,
} from '#validators/auth'
import { createUserValidator } from '#validators/user'
import { AuthService } from '#services/auth_service'
import User from '#models/user'
import { inject } from '@adonisjs/core'
import multiavatar from '@multiavatar/multiavatar/esm'
import SendEmailVerification from '#jobs/send_email_verification'
import SendEmailResetPassword from '#jobs/send_email_reset_password'

@inject()
export default class AuthController {
  constructor(protected authService: AuthService) {}

  /**
   * Handle form submission for the login action
   */
  async login({ auth, request, response }: HttpContext) {
    const { email, password } = await request.validateUsing(createEmailAndPasswordValidator)
    const user = await User.verifyCredentials(email, password)
    if (user.isBlocked) {
      request.ctx?.session.flash('notification', {
        type: 'danger',
        message: 'Sua conta está bloqueada.',
      })
      return response.redirect().toRoute('auth.login.view')
    }
    await auth.use('web').login(user)
    return response.redirect().toRoute('web.home')
  }

  /**
   * Handle form submission for the create new user action
   */
  async store({ request, response }: HttpContext) {
    const { passwordConfirmation, isAdmin, ...rest } =
      await request.validateUsing(createUserValidator)
    const svg = multiavatar(rest.fullName)
    const avatarUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
    if (isAdmin === true) {
      await User.create({ ...rest, isBlocked: true, isAdmin: false, avatarUrl })
      return response.redirect().toRoute('auth.login.view')
    }
    await User.create({ ...rest, isAdmin: false, avatarUrl })
    await SendEmailVerification.dispatch({ email: rest.email }, { queueName: 'mail' })
    request.ctx?.session.flash('notification', {
      type: 'success',
      message: 'Verifique a sua caixa do email e clique no link para confirmar o email.',
    })
    return response.redirect().toRoute('auth.login.view')
  }

  /**
   * Handle form submission for the forgot password action
   */
  async forgotPassword({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createEmailValidator)
    await SendEmailResetPassword.dispatch({ email: payload.email }, { queueName: 'mail' })
    request.ctx?.session.flash('notification', {
      type: 'success',
      message: 'Verifique a sua caixa de email e clique no link para resetar a sua palavra-passe.',
    })
    return response.redirect().toRoute('web.home')
  }

  /**
   * Handle form submission for the reset password action
   */
  async resetPassword({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createPasswordValidator)
    await this.authService.resetPassword(payload)
    request.ctx?.session.flash('notification', {
      type: 'success',
      message: 'Palavra-passe resetada com sucesso.',
    })
    return response.redirect().toRoute('auth.login.view')
  }

  async verifyEmail({ request, response }: HttpContext) {
    const token = request.input('token')

    const ok = await this.authService.verifyEmail({ token })
    if (!ok) {
      return response.notFound()
    }
    request.ctx?.session.flash('notification', {
      type: 'success',
      message: 'Email verificado com sucesso.',
    })
    return response.redirect().toRoute('auth.login.view')
  }
}
