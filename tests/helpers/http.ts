import type { ApiResponse } from '@japa/api-client'

/**
 * Com `.redirects(0)` o cliente não segue o redirecionamento, por isso
 * verificamos o estado e o cabeçalho "location" diretamente.
 */
export function assertRedirect(response: ApiResponse, location: string) {
  response.assertStatus(302)
  response.assertHeader('location', location)
}

export const FORBIDDEN_MESSAGE = 'Não tem permissão para realizar esta ação.'

/**
 * Um pedido recusado por falta de permissão: os GET mostram a página 403 e os
 * formulários (POST/PUT/DELETE) voltam atrás com um aviso.
 */
export function assertDenied(response: ApiResponse, method: string) {
  if (method.toLowerCase() === 'get') {
    response.assertStatus(403)
    return
  }

  response.assertStatus(302)
  response.assertFlashMessage('notification', { type: 'danger', message: FORBIDDEN_MESSAGE })
}

/**
 * Um pedido que passou pela autorização e pelo CSRF (mesmo que depois a
 * validação dos dados o devolva ao formulário).
 */
export function assertAllowed(response: ApiResponse, method: string) {
  const flash = (response.flashMessages?.() ?? {}) as Record<string, any>
  const errorCodes = Object.keys(flash.errorsBag ?? {})

  if (method.toLowerCase() === 'get') {
    response.assertStatus(200)
  } else {
    response.assertStatus(302)
  }

  if (
    errorCodes.includes('E_BAD_CSRF_TOKEN') ||
    flash.notification?.message === FORBIDDEN_MESSAGE
  ) {
    throw new Error(`Pedido recusado: ${JSON.stringify(flash)}`)
  }
}
