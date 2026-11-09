import { compose } from '@adonisjs/core/helpers'
import { hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { CategorySchema } from '#database/schema'
import { withUuid } from '#models/mixins/with_uuid'
import Refill from '#models/refill'

export default class Category extends compose(CategorySchema, withUuid()) {
  @hasMany(() => Refill)
  declare refills: HasMany<typeof Refill>
}
