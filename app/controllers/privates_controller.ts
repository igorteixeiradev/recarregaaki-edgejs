import Package from '#models/package'
import Payment from '#models/payment'
import Refill from '#models/refill'
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class PrivatesController {
  async index({ view, request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const users = await User.all()
    const refills = await Refill.all()
    const packages = await Package.all()
    const payments = await Payment.findManyPayments(page, limit)
    const totalAmountPaid = await Payment.totalAmountPaid()
    const totalAmountPaidThisMonth = await Payment.totalAmountPaid(new Date())

    return view.render('pages/private/index', {
      users,
      refills,
      packages,
      payments,
      totalAmountPaid,
      totalAmountPaidThisMonth,
    })
  }
}
