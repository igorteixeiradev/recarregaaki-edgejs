import { errors } from '@adonisjs/auth'
import { errors as bouncerErrors } from '@adonisjs/bouncer'
import app from '@adonisjs/core/services/app'
import { type HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import type { StatusPageRange, StatusPageRenderer } from '@adonisjs/core/types/http'
import { notify } from '#utils/flash'

const guestAuth = {
  user: undefined,
  isAuthenticated: false,
  check: async () => false,
}

const emptyFlashMessages = {
  has: () => false,
  get: () => undefined,
  all: () => ({}),
}

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * Detalhes do erro (Youch) apenas em desenvolvimento.
   */
  protected debug = app.inDev

  /**
   * Páginas de erro personalizadas em produção e nos testes (para os cobrir),
   * ficando o ecrã de debug só para desenvolvimento.
   */
  protected renderStatusPages = !app.inDev

  /**
   * As páginas de erro usam o layout da aplicação, que consulta `auth`. Num 404
   * o middleware de autenticação nem chegou a correr, por isso usamos um
   * visitante "falso" quando `ctx.auth` não existe.
   */
  protected statusPages: Record<StatusPageRange, StatusPageRenderer> = {
    '403': (error, ctx) => this.#renderStatusPage('pages/errors/forbidden', error, ctx),
    '404': (error, ctx) => this.#renderStatusPage('pages/errors/not_found', error, ctx),
    '500..599': (error, ctx) => this.#renderStatusPage('pages/errors/server_error', error, ctx),
  }

  /**
   * O layout só enxerga dados partilhados (`share`), por isso `auth` e as
   * mensagens flash têm de ser partilhados e não passados no `render`. Num 404
   * os middlewares de sessão e auth não correram, daí os valores "vazios".
   */
  #renderStatusPage(template: string, error: unknown, { view, auth, session }: HttpContext) {
    return view
      .share({
        auth: auth ?? guestAuth,
        flashMessages: session?.flashMessages ?? emptyFlashMessages,
      })
      .render(template, { error })
  }

  async handle(error: unknown, ctx: HttpContext) {
    if (error instanceof errors.E_INVALID_CREDENTIALS) {
      notify(ctx.session, 'danger', 'Credenciais inválidas')
      return ctx.response.redirect().back()
    }

    /**
     * Falta de permissão. O erro do Bouncer responde sozinho com texto simples,
     * por isso tratamos nós: formulários (POST/PUT/DELETE) voltam à página
     * anterior com um aviso; os GET mostram a página 403.
     */
    if (
      error instanceof bouncerErrors.E_AUTHORIZATION_FAILURE &&
      !ctx.request.header('accept')?.includes('application/json')
    ) {
      if (['GET', 'HEAD'].includes(ctx.request.method())) {
        const html = await this.#renderStatusPage('pages/errors/forbidden', error, ctx)
        return ctx.response.status(403).send(html)
      }

      notify(ctx.session, 'danger', 'Não tem permissão para realizar esta ação.')
      return ctx.response.redirect().back()
    }

    /**
     * Apagar algo que ainda está a ser usado (ex: um pacote com pagamentos).
     */
    if (isForeignKeyViolation(error)) {
      notify(ctx.session, 'danger', 'Não é possível apagar: existem registos associados.')
      return ctx.response.redirect().back()
    }

    return super.handle(error, ctx)
  }

  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}

/**
 * O SQLite devolve códigos diferentes (ex: SQLITE_CONSTRAINT_TRIGGER para
 * RESTRICT), por isso confirmamos também pela mensagem.
 */
function isForeignKeyViolation(error: unknown): boolean {
  const { code, message } = (error ?? {}) as { code?: unknown; message?: unknown }

  return (
    typeof code === 'string' &&
    code.startsWith('SQLITE_CONSTRAINT') &&
    /FOREIGN KEY/i.test(String(message ?? ''))
  )
}
