import { compose } from '@adonisjs/core/helpers'
import { belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { RefillSchema } from '#database/schema'
import { withUuid } from '#models/mixins/with_uuid'
import Category from '#models/category'
import Package from '#models/package'

export default class Refill extends compose(RefillSchema, withUuid()) {
  @belongsTo(() => Category)
  declare category: BelongsTo<typeof Category>

  @hasMany(() => Package)
  declare packages: HasMany<typeof Package>
}
