import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { urlFor } from '@adonisjs/core/services/url_builder'
import PackageService from '#services/package_service'
import RefillService from '#services/refill_service'
import { notify } from '#utils/flash'
import { pageParams } from '#utils/pagination'
import { createPackageValidator, updatePackageValidator } from '#validators/package'

/**
 * Pacotes de uma recarga (rota aninhada: /dashboard/:refillId/pacotes).
 */
@inject()
export default class PackagesController {
  constructor(
    protected packages: PackageService,
    protected refills: RefillService
  ) {}

  async index({ bouncer, params, request, view }: HttpContext) {
    await bouncer.with('PackagePolicy').authorize('viewList')

    const refill = await this.refills.findOrFail(params.refillId)
    const packages = await this.packages.paginateByRefill(refill, pageParams(request))
    packages.baseUrl(urlFor('packages.index', { refillId: refill.id }))

    return view.render('pages/private/packages/index', { packages, refill })
  }

  async create({ bouncer, params, view }: HttpContext) {
    await bouncer.with('PackagePolicy').authorize('create')

    const refill = await this.refills.findOrFail(params.refillId)
    return view.render('pages/private/packages/create', { refillId: refill.id })
  }

  async store({ bouncer, params, request, response, session }: HttpContext) {
    await bouncer.with('PackagePolicy').authorize('create')

    // O refillId vem sempre da rota, nunca do corpo do pedido
    const payload = await request.validateUsing(createPackageValidator, {
      data: { ...request.all(), refillId: params.refillId },
    })
    await this.packages.create(payload)

    notify(session, 'success', 'Pacote adicionado com sucesso')
    return response.redirect().toRoute('packages.index', { refillId: params.refillId })
  }

  async edit({ bouncer, params, view }: HttpContext) {
    await bouncer.with('PackagePolicy').authorize('update')

    const pkg = await this.packages.findForRefillOrFail(params.refillId, params.id)
    return view.render('pages/private/packages/edit', { refillId: params.refillId, pkg })
  }

  async update({ bouncer, params, request, response, session }: HttpContext) {
    await bouncer.with('PackagePolicy').authorize('update')

    const pkg = await this.packages.findForRefillOrFail(params.refillId, params.id)
    const payload = await request.validateUsing(updatePackageValidator, {
      meta: { packageId: pkg.id },
    })
    await this.packages.update(pkg, payload)

    notify(session, 'success', 'Pacote actualizado com sucesso')
    return response.redirect().toRoute('packages.index', { refillId: params.refillId })
  }

  async destroy({ bouncer, params, response, session }: HttpContext) {
    await bouncer.with('PackagePolicy').authorize('delete')

    const pkg = await this.packages.findForRefillOrFail(params.refillId, params.id)
    await this.packages.delete(pkg)

    notify(session, 'success', 'Pacote apagado com sucesso')
    return response.redirect().toRoute('packages.index', { refillId: params.refillId })
  }
}
