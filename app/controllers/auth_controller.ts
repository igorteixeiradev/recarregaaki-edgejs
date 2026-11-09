import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import AuthService from '#services/auth_service'
import UserService from '#services/user_service'
import { notify } from '#utils/flash'
import {
  forgotPasswordValidator,
  loginValidator,
  registerValidator,
  resetPasswordValidator,
} from '#validators/auth'

@inject()
export default class AuthController {
  constructor(
    protected auth: AuthService,
    protected users: UserService
  ) {}

  async register({ request, response, session }: HttpContext) {
    const payload = await request.validateUsing(registerValidator)
    await this.auth.register(payload)

    notify(
      session,
      'success',
      'Verifique a sua caixa do email e clique no link para confirmar o email.'
    )
    return response.redirect().toRoute('auth.login.view')
  }

  async login({ request, response, session, auth }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)
    const user = await this.users.verifyCredentials(email, password)

    if (user.isBlocked) {
      notify(session, 'danger', 'A sua conta está bloqueada. Contacte o suporte.')
      return response.redirect().back()
    }

    await auth.use('web').login(user)
    return response.redirect().toRoute('web.home')
  }

  async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect().toRoute('web.home')
  }

  async forgotPassword({ request, response, session }: HttpContext) {
    const { email } = await request.validateUsing(forgotPasswordValidator)
    await this.auth.requestPasswordReset(email)

    // A mesma resposta exista ou não a conta
    notify(
      session,
      'success',
      'Se o email estiver registado, enviámos as instruções para redefinir a palavra-passe.'
    )
    return response.redirect().toRoute('web.home')
  }

  async showResetPassword({ request, view }: HttpContext) {
    const token = request.input('token')
    return view.render('pages/public/auth/reset-password', { token })
  }

  async resetPassword({ request, response, session }: HttpContext) {
    const { token, password } = await request.validateUsing(resetPasswordValidator)

    if (!(await this.auth.resetPassword(token, password))) {
      notify(session, 'danger', 'O link é inválido ou expirou. Peça um novo.')
      return response.redirect().toRoute('auth.forgot-password.view')
    }

    notify(session, 'success', 'Palavra-passe redefinida com sucesso. Já pode entrar.')
    return response.redirect().toRoute('auth.login.view')
  }

  async verifyEmail({ request, response, session, auth }: HttpContext) {
    const token = String(request.input('token', ''))
    const verified = token.length > 0 && (await this.auth.verifyEmail(token))

    notify(
      session,
      verified ? 'success' : 'danger',
      verified ? 'Email confirmado com sucesso.' : 'O link é inválido ou expirou. Peça um novo.'
    )

    const isLoggedIn = await auth.check()
    return response.redirect().toRoute(isLoggedIn ? 'web.profile' : 'auth.login.view')
  }

  async resendVerificationEmail({ auth, response, session }: HttpContext) {
    const sent = await this.auth.resendVerificationEmail(auth.getUserOrFail())

    notify(
      session,
      'success',
      sent
        ? 'Verifique a sua caixa do email e clique no link para confirmar o email.'
        : 'O seu email já está confirmado.'
    )
    return response.redirect().toRoute('web.profile')
  }
}
