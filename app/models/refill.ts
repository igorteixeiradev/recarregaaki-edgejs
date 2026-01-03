import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import { randomUUID } from 'node:crypto'
import { type BelongsTo } from '@adonisjs/lucid/types/relations'
import Category from '#models/category'

export default class Refill extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare image: string

  @column()
  declare description: string

  @column()
  declare isActive: boolean

  @column()
  declare categoryId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Category)
  declare category: BelongsTo<typeof Category>

  static async findManyRefills(page: number, limit: number) {
    const reffils = await this.query()
      .orderBy('createdAt', 'desc')
      .preload('category')
      .paginate(page, limit)
    reffils.baseUrl('/dashboard/recargas')
    return reffils
  }

  static async findRefillById(id: string) {
    return await this.query().where('id', id).firstOrFail()
  }

  @beforeCreate()
  static assignUuid(refill: Refill) {
    refill.id = randomUUID()
  }
}
