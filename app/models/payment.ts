import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import { randomUUID } from 'node:crypto'
import { type BelongsTo } from '@adonisjs/lucid/types/relations'
import Package from '#models/package'
import User from '#models/user'

export default class Payment extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare packageId: string

  @column()
  declare method: string

  @column()
  declare reference: string | null

  @column()
  declare amount: number

  @column.dateTime()
  declare paidAt: DateTime | null

  @column()
  declare status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELED'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Package)
  declare package: BelongsTo<typeof Package>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  static async totalAmountPaid(date?: Date) {
    if (!date) {
      const payments = await this.query().where('status', 'PAID')

      return payments.reduce((acc, payment) => {
        return acc + Number(payment.amount)
      }, 0)
    }

    const month = date.getMonth()
    const year = date.getFullYear()

    const payments = await this.query().where('status', 'PAID')

    return payments.reduce((acc, payment) => {
      if (!payment.paidAt) return acc

      const paidAt = payment.paidAt.toJSDate()

      if (paidAt.getMonth() === month && paidAt.getFullYear() === year) {
        acc += Number(payment.amount)
      }

      return acc
    }, 0)
  }

  @beforeCreate()
  static assignUuid(payment: Payment) {
    payment.id = randomUUID()
  }
}
