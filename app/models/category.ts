import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, hasMany } from '@adonisjs/lucid/orm'
import { randomUUID } from 'node:crypto'
import { type HasMany } from '@adonisjs/lucid/types/relations'
import Refill from '#models/refill'

export default class Category extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => Refill)
  declare refills: HasMany<typeof Refill>

  @beforeCreate()
  static assignUuid(category: Category) {
    category.id = randomUUID()
  }
}
