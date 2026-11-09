import type { HttpContext } from '@adonisjs/core/http'

/**
 * Mensagem mostrada no topo da página (ver layout 'notification').
 */
export function notify(
  session: HttpContext['session'],
  type: 'success' | 'danger',
  message: string
) {
  session.flash('notification', { type, message })
}
