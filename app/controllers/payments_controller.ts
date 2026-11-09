import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { urlFor } from '@adonisjs/core/services/url_builder'
import PaymentService from '#services/payment_service'
import { pageParams } from '#utils/pagination'

@inject()
export default class PaymentsController {
  constructor(protected payments: PaymentService) {}

  async index({ bouncer, request, view }: HttpContext) {
    await bouncer.with('PaymentPolicy').authorize('viewList')

    const payments = await this.payments.paginate(pageParams(request))
    payments.baseUrl(urlFor('payments.index'))

    return view.render('pages/private/payments/index', { payments })
  }
}
