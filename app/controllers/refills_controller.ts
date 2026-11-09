import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { urlFor } from '@adonisjs/core/services/url_builder'
import CategoryService from '#services/category_service'
import RefillService from '#services/refill_service'
import { notify } from '#utils/flash'
import { pageParams } from '#utils/pagination'
import { createRefillValidator, updateRefillValidator } from '#validators/refill'

@inject()
export default class RefillsController {
  constructor(
    protected refills: RefillService,
    protected categories: CategoryService
  ) {}

  async index({ bouncer, request, view }: HttpContext) {
    await bouncer.with('RefillPolicy').authorize('viewList')

    const refills = await this.refills.paginate(pageParams(request))
    refills.baseUrl(urlFor('refills.index'))

    return view.render('pages/private/refills/index', { refills })
  }

  async create({ bouncer, view }: HttpContext) {
    await bouncer.with('RefillPolicy').authorize('create')

    const categories = await this.categories.listAll()
    return view.render('pages/private/refills/create', { categories })
  }

  async store({ bouncer, request, response, session }: HttpContext) {
    await bouncer.with('RefillPolicy').authorize('create')

    const payload = await request.validateUsing(createRefillValidator)
    await this.refills.create(payload)

    notify(session, 'success', 'Recarga adicionada com sucesso')
    return response.redirect().toRoute('refills.index')
  }

  async edit({ bouncer, params, view }: HttpContext) {
    await bouncer.with('RefillPolicy').authorize('update')

    const [refill, categories] = await Promise.all([
      this.refills.findOrFail(params.id),
      this.categories.listAll(),
    ])
    return view.render('pages/private/refills/edit', { categories, refill })
  }

  async update({ bouncer, params, request, response, session }: HttpContext) {
    await bouncer.with('RefillPolicy').authorize('update')

    const refill = await this.refills.findOrFail(params.id)
    const payload = await request.validateUsing(updateRefillValidator, {
      meta: { refillId: refill.id },
    })
    await this.refills.update(refill, payload)

    notify(session, 'success', 'Recarga actualizada com sucesso')
    return response.redirect().toRoute('refills.index')
  }

  async destroy({ bouncer, params, response, session }: HttpContext) {
    await bouncer.with('RefillPolicy').authorize('delete')

    const refill = await this.refills.findOrFail(params.id)
    await this.refills.delete(refill)

    notify(session, 'success', 'Recarga apagada com sucesso')
    return response.redirect().toRoute('refills.index')
  }
}
