import { compose } from '@adonisjs/core/helpers'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { PaymentSchema } from '#database/schema'
import { withUuid } from '#models/mixins/with_uuid'
import Package from '#models/package'
import User from '#models/user'
import type { PaymentStatus } from '#enums/payment_status'

export default class Payment extends compose(PaymentSchema, withUuid()) {
  declare status: PaymentStatus

  @belongsTo(() => Package)
  declare package: BelongsTo<typeof Package>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
