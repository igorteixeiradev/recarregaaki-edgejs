import { notify } from '#utils/flash'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Silent auth middleware can be used as a global middleware to silent check
 * if the user is logged-in or not.
 *
 * The request continues as usual, even when the user is not logged-in.
 */
export default class SilentAuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    await ctx.auth.check()

    // Um utilizador bloqueado perde a sessão mesmo que já estivesse autenticado
    if (ctx.auth.user?.isBlocked) {
      await ctx.auth.use('web').logout()
      notify(ctx.session, 'danger', 'A sua conta está bloqueada. Contacte o suporte.')
    }

    return next()
  }
}
