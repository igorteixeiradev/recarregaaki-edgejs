import { isAdmin } from '#abilities/main'
import User from '#models/user'
import { createUserValidator, updateUserValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
  /**
   * Display a list of resource
   */
  async index({ request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const users = await User.query().orderBy('createdAt', 'desc').paginate(page, limit)
    users.baseUrl('/dashboard/consumidores')
    return request.ctx?.view.render('pages/private/usr/index', { users })
  }

  /**
   * Display form to create a new record
   */
  async create({ view }: HttpContext) {
    return view.render('pages/private/usr/create')
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request }: HttpContext) {
    const { passwordConfirmation, ...rest } = await request.validateUsing(createUserValidator)
    await User.create({ ...rest })
    request.ctx?.session.flash('notification', {
      type: 'success',
      message: 'Consumidor adicionado com sucesso',
    })
    return request.ctx?.response.redirect().toRoute('users.index')
  }

  /**
   * Show individual record
   */
  async show({ params }: HttpContext) {
    return await User.findByOrFail('id', params.id)
  }

  /**
   * Edit individual record
   */
  async edit({ params, view }: HttpContext) {
    const user = await User.findByOrFail('id', params.id)
    return view.render('pages/private/usr/edit', { user })
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request }: HttpContext) {
    if (await request.ctx?.bouncer.denies(isAdmin)) {
      return request.ctx?.response.forbidden()
    }

    const payload = await request.validateUsing(updateUserValidator)
    const user = await User.findByOrFail('id', params.id)
    user.merge(payload)
    await user.save()
    request.ctx?.session.flash('notification', {
      type: 'success',
      message: 'Consumidor actualizado com sucesso',
    })
    return request.ctx?.response.redirect().toRoute('users.index')
  }

  /**
   * Delete record
   */
  async destroy({ params, request }: HttpContext) {
    if (await request.ctx?.bouncer.denies(isAdmin)) {
      return request.ctx?.response.forbidden()
    }

    const user = await User.findByOrFail('id', params.id)
    await user.delete()

    request.ctx?.session.flash('notification', {
      type: 'success',
      message: 'Consumidor apagado com sucesso',
    })

    return request.ctx?.response.redirect().toRoute('users.index')
  }
}
