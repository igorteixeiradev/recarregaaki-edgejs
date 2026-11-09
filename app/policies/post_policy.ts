import type User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'

/**
 * Apenas administradores podem gerir este recurso.
 */
export default class PostPolicy extends BasePolicy {
  viewList(user: User): AuthorizerResponse {
    return user.isAdmin
  }

  create(user: User): AuthorizerResponse {
    return user.isAdmin
  }

  update(user: User): AuthorizerResponse {
    return user.isAdmin
  }

  delete(user: User): AuthorizerResponse {
    return user.isAdmin
  }
}
