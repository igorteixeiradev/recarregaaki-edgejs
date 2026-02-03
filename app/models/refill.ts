import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import { randomUUID } from 'node:crypto'
import { type HasMany, type BelongsTo } from '@adonisjs/lucid/types/relations'
import Category from '#models/category'
import Package from '#models/package'

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

  @column()
  declare otherName: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Category)
  declare category: BelongsTo<typeof Category>

  @hasMany(() => Package)
  declare packages: HasMany<typeof Package>

  static async findManyRefills(page: number, limit: number) {
    const refills = await this.query()
      .orderBy('createdAt', 'desc')
      .preload('category')
      .preload('packages')
      .paginate(page, limit)

    return refills.baseUrl('/dashboard/recargas')
  }

  static async findRefillById(id: string) {
    return await this.query()
      .where('id', id)
      .preload('category')
      .preload('packages', (query) => {
        query.orderBy('price', 'asc')
      })
      .firstOrFail()
  }

  static async findManyRefillByIsActive(isActive: boolean) {
    return await this.query()
      .has('packages')
      .orderBy('createdAt', 'desc')
      .where('isActive', isActive)
      .preload('category')
      .preload('packages')
  }

  static async findManyRefillsBySearchTerm(
    page: number,
    limit: number,
    text?: string,
    categoryId?: string
  ) {
    const refills = await this.query()
      .has('packages')
      .orderBy('createdAt', 'desc')
      .where('isActive', true)
      .andWhere((builder) => {
        if (text) {
          builder.whereILike('name', `%${text}%`).orWhereILike('description', `%${text}%`)
        }

        if (categoryId) {
          builder.where('categoryId', categoryId)
        }
      })
      .preload('category')
      .paginate(page, limit)

    return refills.baseUrl('/loja')
  }

  @beforeCreate()
  static assignUuid(refill: Refill) {
    refill.id = randomUUID()
  }
}
