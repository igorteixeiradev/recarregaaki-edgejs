import type User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'

/**
 * Apenas administradores podem gerir este recurso.
 */
export default class DashboardPolicy extends BasePolicy {
  view(user: User): AuthorizerResponse {
    return user.isAdmin
  }

  viewExchangeRates(user: User): AuthorizerResponse {
    return user.isAdmin
  }
}
