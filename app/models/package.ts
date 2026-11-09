import { compose } from '@adonisjs/core/helpers'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { PackageSchema } from '#database/schema'
import { withUuid } from '#models/mixins/with_uuid'
import Refill from '#models/refill'

export default class Package extends compose(PackageSchema, withUuid()) {
  @belongsTo(() => Refill)
  declare refill: BelongsTo<typeof Refill>
}
