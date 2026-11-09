import { compose } from '@adonisjs/core/helpers'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { PostSchema } from '#database/schema'
import { withUuid } from '#models/mixins/with_uuid'
import User from '#models/user'

export default class Post extends compose(PostSchema, withUuid()) {
  @belongsTo(() => User, { foreignKey: 'userId' })
  declare author: BelongsTo<typeof User>
}
