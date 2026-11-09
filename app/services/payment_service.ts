import { DateTime } from 'luxon'
import Payment from '#models/payment'
import { PaymentStatus } from '#enums/payment_status'
import { toDbDate } from '#utils/dates'
import type { PageParams } from '#utils/pagination'

export default class PaymentService {
  /**
   * Listagem do painel: todos os pagamentos com consumidor e pacote.
   */
  paginate({ page, limit }: PageParams) {
    return Payment.query()
      .orderBy('createdAt', 'desc')
      .preload('user')
      .preload('package')
      .paginate(page, limit)
  }

  /**
   * Histórico de um consumidor (página de perfil).
   */
  paginateByUser(userId: string, { page, limit }: PageParams) {
    return Payment.query()
      .where('userId', userId)
      .orderBy('createdAt', 'desc')
      .preload('package')
      .paginate(page, limit)
  }

  /**
   * Soma dos pagamentos concluídos, calculada na base de dados.
   */
  async totalPaid(): Promise<number> {
    const row = await Payment.query()
      .where('status', PaymentStatus.Paid)
      .sum('amount as total')
      .first()

    return Number(row?.$extras.total ?? 0)
  }

  /**
   * Soma dos pagamentos concluídos no mês da data de referência.
   */
  async totalPaidInMonth(reference: DateTime = DateTime.now()): Promise<number> {
    const row = await Payment.query()
      .where('status', PaymentStatus.Paid)
      .whereBetween('paidAt', [
        toDbDate(reference.startOf('month')),
        toDbDate(reference.endOf('month')),
      ])
      .sum('amount as total')
      .first()

    return Number(row?.$extras.total ?? 0)
  }
}
