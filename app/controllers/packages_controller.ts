import { isAdmin } from '#abilities/main'
import Package from '#models/package'
import { createPackageValidator, updatePackageValidator } from '#validators/package'
import type { HttpContext } from '@adonisjs/core/http'

export default class PackagesController {
  /**
   * Display a list of resource
   */
  async index({ view, params, request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const packages = await Package.findManyPackagesByRefillIdAndPagenation(
      params.refillId,
      page,
      limit
    )
    return view.render('pages/private/packages/index', { packages, refillId: params.refillId })
  }

  /**
   * Display form to create a new record
   */
  async create({ view, params }: HttpContext) {
    return view.render('pages/private/packages/create', { refillId: params.refillId })
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request }: HttpContext) {
    if (await request.ctx?.bouncer.denies(isAdmin)) {
      return request.ctx?.response.forbidden()
    }

    const payload = await request.validateUsing(createPackageValidator)
    await Package.create(payload)

    request.ctx?.session.flash('notification', {
      type: 'success',
      message: 'Pacote adicionada com sucesso',
    })

    return request.ctx?.response.redirect().toPath(`/dashboard/${payload.refillId}/pacotes`)
  }

  /**
   * Show individual record
   */
  async show({ params }: HttpContext) {
    return await Package.findByOrFail('id', params.id)
  }

  /**
   * Edit individual record
   */
  async edit({ params, view }: HttpContext) {
    const pkg = await Package.findByOrFail('id', params.id)
    return view.render('pages/private/packages/edit', { refillId: params.refillId, pkg })
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request }: HttpContext) {
    if (await request.ctx?.bouncer.denies(isAdmin)) {
      return request.ctx?.response.forbidden()
    }

    const payload = await request.validateUsing(updatePackageValidator)
    const pkg = await Package.findByOrFail('id', params.id)
    pkg.merge(payload)
    await pkg.save()

    request.ctx?.session.flash('notification', {
      type: 'success',
      message: 'Pacote actualizado com sucesso',
    })

    return request.ctx?.response.redirect().toPath(`/dashboard/${payload.refillId}/pacotes`)
  }

  /**
   * Delete record
   */
  async destroy({ params, request }: HttpContext) {
    if (await request.ctx?.bouncer.denies(isAdmin)) {
      return request.ctx?.response.forbidden()
    }
    const pkg = await Package.findByOrFail('id', params.id)
    await pkg.delete()

    request.ctx?.session.flash('notification', {
      type: 'success',
      message: 'Pacote apagado com sucesso',
    })
    return request.ctx?.response.redirect().toPath(`/dashboard/${params.refillId}/pacotes`)
  }
}
