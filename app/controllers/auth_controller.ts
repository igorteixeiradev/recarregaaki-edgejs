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

@inject()
export default class AuthController {
  constructor(protected authService: AuthService) {}

  /**
   * Handle form submission for the login action
   */
  async login({ auth, request, response }: HttpContext) {
    const { email, password } = await request.validateUsing(createEmailAndPasswordValidator)
    const user = await User.verifyCredentials(email, password)
    await auth.use('web').login(user)
    return response.redirect().toRoute('web.home')
  }

  /**
   * Handle form submission for the create new user action
   */
  async store({ request, response }: HttpContext) {
    const { passwordConfirmation, ...rest } = await request.validateUsing(createUserValidator)
    await User.create({ ...rest })
    return response.redirect().toRoute('auth.login.view')
  }

  /**
   * Handle form submission for the forgot password action
   */
  async forgotPassword({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createEmailValidator)
    await this.authService.forgotPassword(payload)
    return response.redirect().toRoute('web.home')
  }

  /**
   * Handle form submission for the reset password action
   */
  async resetPassword({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createPasswordValidator)
    await this.authService.resetPassword(payload)
    return response.redirect().toRoute('auth.login.view')
  }
}
