import { inject } from '@adonisjs/core'
import Package from '#models/package'
import Refill from '#models/refill'
import User from '#models/user'
import PaymentService from '#services/payment_service'
import type { PageParams } from '#utils/pagination'

type CountableModel = typeof User | typeof Refill | typeof Package

@inject()
export default class DashboardService {
  constructor(protected payments: PaymentService) {}

  async overview(page: PageParams) {
    const [users, refills, packages, payments, totalAmountPaid, totalAmountPaidThisMonth] =
      await Promise.all([
        this.#count(User),
        this.#count(Refill),
        this.#count(Package),
        this.payments.paginate(page),
        this.payments.totalPaid(),
        this.payments.totalPaidInMonth(),
      ])

    return {
      totals: { users, refills, packages },
      payments,
      totalAmountPaid,
      totalAmountPaidThisMonth,
    }
  }

  async #count(model: CountableModel): Promise<number> {
    const row = await model.query().count('* as total').first()
    return Number(row?.$extras.total ?? 0)
  }
}
