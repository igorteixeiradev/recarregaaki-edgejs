import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import { randomUUID } from 'node:crypto'
import Refill from '#models/refill'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Package extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare price: number

  @column()
  declare isActive: boolean

  @column()
  declare isSpecialOffer: boolean

  @column()
  declare refillId: string

  @column()
  declare otherName: string | null

  @belongsTo(() => Refill)
  declare refill: BelongsTo<typeof Refill>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static assignUuid(pkg: Package) {
    pkg.id = randomUUID()
  }
}
