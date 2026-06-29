import { isAdmin } from '#abilities/main'
import Package from '#models/package'
import Refill from '#models/refill'
import { createPackageValidator, updatePackageValidator } from '#validators/package'
import type { HttpContext } from '@adonisjs/core/http'

export default class PackagesController {
  /**
   * Display a list of resource
   */
  async index({ view, params, request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)

    const [packages, refill] = await Promise.all([
      (async () => {
        const p = await Package.query()
          .orderBy('createdAt', 'desc')
          .where('refillId', params.refillId)
          .preload('refill')
          .paginate(page, limit)
        p.baseUrl(`/dashboard/${params.refillId}/pacotes`)
        return p
      })(),
      Refill.findOrFail(params.refillId),
    ])

    if (await request.ctx?.bouncer.denies(isAdmin)) {
      return request.ctx?.response.forbidden()
    }
    return view.render('pages/private/packages/index', {
      packages,
      refill,
    })
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
    const payload = await request.validateUsing(createPackageValidator)
    if (await request.ctx?.bouncer.denies(isAdmin)) {
      return request.ctx?.response.forbidden()
    }
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
  async show({ params, request }: HttpContext) {
    if (await request.ctx?.bouncer.denies(isAdmin)) {
      return request.ctx?.response.forbidden()
    }
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
    const payload = await request.validateUsing(updatePackageValidator)
    const pkg = await Package.findByOrFail('id', params.id)
    if (await request.ctx?.bouncer.denies(isAdmin)) {
      return request.ctx?.response.forbidden()
    }
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
    const pkg = await Package.findByOrFail('id', params.id)
    if (await request.ctx?.bouncer.denies(isAdmin)) {
      return request.ctx?.response.forbidden()
    }
    await pkg.delete()

    request.ctx?.session.flash('notification', {
      type: 'success',
      message: 'Pacote apagado com sucesso',
    })
    return request.ctx?.response.redirect().toPath(`/dashboard/${params.refillId}/pacotes`)
  }
}
