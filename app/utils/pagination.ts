import type { HttpContext } from '@adonisjs/core/http'

export type PageParams = { page: number; limit: number }

const MAX_LIMIT = 100

/**
 * Lê 'page' e 'limit' da query string de forma segura. Valores inválidos
 * (texto, negativos, enormes) caem para valores por defeito em vez de gerar
 * erros 500 na base de dados.
 */
export function pageParams(request: HttpContext['request'], defaultLimit = 20): PageParams {
  const page = Number.parseInt(String(request.input('page')), 10)
  const limit = Number.parseInt(String(request.input('limit')), 10)

  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    limit: Number.isInteger(limit) && limit > 0 ? Math.min(limit, MAX_LIMIT) : defaultLimit,
  }
}
