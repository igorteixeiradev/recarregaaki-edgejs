import { isAdmin } from '#abilities/main'
import Category from '#models/category'
import Refill from '#models/refill'
import { RefillService } from '#services/refill_service'
import { createRefillValidator, updateRefillValidator } from '#validators/refill'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class RefillsController {
  constructor(protected refillService: RefillService) {}
  /**
   * Display a list of resource
   */
  async index({ view, request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const refills = await Refill.query()
      .orderBy('createdAt', 'desc')
      .preload('category')
      .preload('packages')
      .paginate(page, limit)

    refills.baseUrl('/dashboard/recargas')
    if (await request.ctx?.bouncer.denies(isAdmin)) {
      return request.ctx?.response.forbidden()
    }
    return view.render('pages/private/refills/index', { refills })
  }

  /**
   * Display form to create a new record
   */
  async create({ view }: HttpContext) {
    const categories = await Category.findManyBy('isActive', true)
    return view.render('pages/private/refills/create', { categories })
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request }: HttpContext) {
    const payload = await request.validateUsing(createRefillValidator)
    if (await request.ctx?.bouncer.denies(isAdmin)) {
      return request.ctx?.response.forbidden()
    }
    await this.refillService.createRefillAndUploadImage(payload)

    request.ctx?.session.flash('notification', {
      type: 'success',
      message: 'Recarga adicionada com sucesso',
    })

    return request.ctx?.response.redirect().toRoute('refills.index')
  }

  /**
   * Show individual record
   */
  async show({ params }: HttpContext) {
    return await Refill.findByOrFail('id', params.id)
  }

  /**
   * Edit individual record
   */
  async edit({ params, view, request }: HttpContext) {
    const categories = await Category.findManyCategoriesByActive(true)
    const refill = await Refill.findByOrFail('id', params.id)
    if (await request.ctx?.bouncer.denies(isAdmin)) {
      return request.ctx?.response.forbidden()
    }
    return view.render('pages/private/refills/edit', { categories, refill })
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request }: HttpContext) {
    const payload = await request.validateUsing(updateRefillValidator)
    if (await request.ctx?.bouncer.denies(isAdmin)) {
      return request.ctx?.response.forbidden()
    }
    await this.refillService.updateRefillAndUploadImage(params.id, payload)

    request.ctx?.session.flash('notification', {
      type: 'success',
      message: 'Recarga actualizada com sucesso',
    })

    return request.ctx?.response.redirect().toRoute('refills.index')
  }

  /**
   * Delete record
   */
  async destroy({ params, request }: HttpContext) {
    const refill = await Refill.findByOrFail('id', params.id)
    if (await request.ctx?.bouncer.denies(isAdmin)) {
      return request.ctx?.response.forbidden()
    }
    await this.refillService.removeRefillAndRemoveImage(refill.id)
    request.ctx?.session.flash('notification', {
      type: 'success',
      message: 'Recarga apagada com sucesso',
    })
    return request.ctx?.response.redirect().toRoute('refills.index')
  }
}
