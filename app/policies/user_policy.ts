import type User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class UserPolicy extends BasePolicy {
  viewList(user: User): AuthorizerResponse {
    return user.isAdmin
  }

  create(user: User): AuthorizerResponse {
    return user.isAdmin
  }

  update(user: User): AuthorizerResponse {
    return user.isAdmin
  }

  /**
   * Um administrador não pode apagar a própria conta (evita ficar sem
   * nenhum administrador por engano).
   */
  delete(user: User, target: User): AuthorizerResponse {
    return user.isAdmin && user.id !== target.id
  }
}
