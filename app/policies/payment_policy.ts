import type User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'

/**
 * Apenas administradores podem gerir este recurso.
 */
export default class PaymentPolicy extends BasePolicy {
  viewList(user: User): AuthorizerResponse {
    return user.isAdmin
  }
}
