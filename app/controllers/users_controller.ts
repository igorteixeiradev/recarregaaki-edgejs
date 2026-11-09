import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { urlFor } from '@adonisjs/core/services/url_builder'
import UserService from '#services/user_service'
import { notify } from '#utils/flash'
import { pageParams } from '#utils/pagination'
import { createUserValidator, updateUserValidator } from '#validators/user'

@inject()
export default class UsersController {
  constructor(protected users: UserService) {}

  async index({ bouncer, request, view }: HttpContext) {
    await bouncer.with('UserPolicy').authorize('viewList')

    const users = await this.users.paginate(pageParams(request))
    users.baseUrl(urlFor('users.index'))

    return view.render('pages/private/usr/index', { users })
  }

  async create({ bouncer, view }: HttpContext) {
    await bouncer.with('UserPolicy').authorize('create')
    return view.render('pages/private/usr/create')
  }

  async store({ bouncer, request, response, session }: HttpContext) {
    await bouncer.with('UserPolicy').authorize('create')

    const payload = await request.validateUsing(createUserValidator)
    await this.users.create(payload)

    notify(session, 'success', 'Consumidor adicionado com sucesso')
    return response.redirect().toRoute('users.index')
  }

  async edit({ bouncer, params, view }: HttpContext) {
    await bouncer.with('UserPolicy').authorize('update')

    const user = await this.users.findOrFail(params.id)
    return view.render('pages/private/usr/edit', { user })
  }

  async update({ auth, bouncer, params, request, response, session }: HttpContext) {
    await bouncer.with('UserPolicy').authorize('update')

    const user = await this.users.findOrFail(params.id)
    const payload = await request.validateUsing(updateUserValidator, { meta: { userId: user.id } })
    await this.users.update(auth.getUserOrFail(), user, payload)

    notify(session, 'success', 'Consumidor actualizado com sucesso')
    return response.redirect().toRoute('users.index')
  }

  async destroy({ bouncer, params, response, session }: HttpContext) {
    // Primeiro a regra geral (só admins); depois a regra que depende do alvo
    await bouncer.with('UserPolicy').authorize('viewList')

    const user = await this.users.findOrFail(params.id)
    await bouncer.with('UserPolicy').authorize('delete', user)
    await this.users.delete(user)

    notify(session, 'success', 'Consumidor apagado com sucesso')
    return response.redirect().toRoute('users.index')
  }
}
