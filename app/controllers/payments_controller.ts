import { isAdmin } from '#abilities/main'
import Payment from '#models/payment'
import type { HttpContext } from '@adonisjs/core/http'

export default class PaymentsController {
  /**
   * Display a list of resource
   */
  async index({ request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)

    const payments = await Payment.query()
      .orderBy('createdAt', 'desc')
      .preload('user')
      .preload('package')
      .paginate(page, limit)
    payments.baseUrl('/dashboard/pagamentos')

    if (await request.ctx?.bouncer.denies(isAdmin)) {
      return request.ctx?.response.forbidden()
    }
    return request.ctx?.view.render('pages/private/payments/index', {
      payments,
    })
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request }: HttpContext) {}

  /**
   * Show individual record
   */
  async show({ params }: HttpContext) {}

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request }: HttpContext) {}

  /**
   * Delete record
   */
  async destroy({ params }: HttpContext) {}
}
