import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { urlFor } from '@adonisjs/core/services/url_builder'
import DashboardService from '#services/dashboard_service'
import ExchangeRateService from '#services/exchange_rate_service'
import { notify } from '#utils/flash'
import { pageParams } from '#utils/pagination'

@inject()
export default class DashboardController {
  constructor(
    protected dashboard: DashboardService,
    protected exchangeRates: ExchangeRateService
  ) {}

  async index({ bouncer, request, view }: HttpContext) {
    await bouncer.with('DashboardPolicy').authorize('view')

    const overview = await this.dashboard.overview(pageParams(request, 10))
    overview.payments.baseUrl(urlFor('dashboard.index'))

    return view.render('pages/private/index', overview)
  }

  async exchangeRate({ bouncer, session, view }: HttpContext) {
    await bouncer.with('DashboardPolicy').authorize('viewExchangeRates')

    const data = await this.exchangeRates.today()
    if (!data) {
      notify(session, 'danger', 'Não foi possível obter as cotações neste momento.')
    }

    return view.render('pages/private/kz', { data: data ?? [] })
  }
}
