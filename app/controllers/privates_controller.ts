import { isAdmin } from '#abilities/main'
import Package from '#models/package'
import Payment from '#models/payment'
import Refill from '#models/refill'
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class PrivatesController {
  url: string

  constructor() {
    this.url =
      'https://bancoyetu.ao/CatalogSearchServices/ExchangeRatesService/ExchangeRates?currencyBase=AKZ&type=D'
  }
  async index({ view, request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const users = await User.all()
    const refills = await Refill.all()
    const packages = await Package.all()
    const payments = await Payment.findManyPayments(page, limit)
    const totalAmountPaid = await Payment.totalAmountPaid()
    const totalAmountPaidThisMonth = await Payment.totalAmountPaid(new Date())
    if (await request.ctx?.bouncer.denies(isAdmin)) {
      return request.ctx?.response.forbidden()
    }
    return view.render('pages/private/index', {
      users,
      refills,
      packages,
      payments,
      totalAmountPaid,
      totalAmountPaidThisMonth,
    })
  }

  async KzToDay({ view }: HttpContext) {
    const response = await fetch(this.url)
    const json = await response.json()
    //@ts-ignore
    const data = json.exchangeRates.map((rate) => ({
      ...rate,
      syncTime: new Date(rate.syncDate).toLocaleDateString('pt-PT'),
    })) as any

    return view.render('pages/private/kz', { data })
  }
}
