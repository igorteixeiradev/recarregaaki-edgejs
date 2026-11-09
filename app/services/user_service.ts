import multiavatar from '@multiavatar/multiavatar/esm'
import User from '#models/user'
import type { PageParams } from '#utils/pagination'
import type { CreateUserPayload, UpdateUserPayload } from '#validators/user'

type NewUser = {
  fullName: string
  email: string
  password: string
  isAdmin?: boolean
}

export default class UserService {
  findByEmail(email: string) {
    return User.findBy('email', email)
  }

  findOrFail(id: string) {
    return User.findOrFail(id)
  }

  paginate({ page, limit }: PageParams) {
    return User.query().orderBy('createdAt', 'desc').paginate(page, limit)
  }

  /**
   * Lança E_INVALID_CREDENTIALS se o email ou a palavra-passe estiverem errados.
   */
  verifyCredentials(email: string, password: string) {
    return User.verifyCredentials(email, password)
  }

  create(data: NewUser | CreateUserPayload) {
    return User.create({ ...data, avatarUrl: this.#avatarFor(data.fullName) })
  }

  /**
   * `actor` é o administrador que faz a alteração. Não pode retirar a si próprio
   * o papel de admin nem bloquear a própria conta.
   */
  async update(actor: User, user: User, payload: UpdateUserPayload) {
    const changes = { ...payload }

    if (actor.id === user.id) {
      delete changes.isAdmin
      delete changes.isBlocked
    }

    user.merge(changes)
    await user.save()
    return user
  }

  async delete(user: User) {
    await user.delete()
  }

  async markEmailVerified(email: string) {
    await User.query().where('email', email).update({ isEmailVerified: true })
  }

  async changePassword(user: User, password: string) {
    user.password = password
    await user.save()
  }

  #avatarFor(name: string): string {
    const svg = multiavatar(name)
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
  }
}
