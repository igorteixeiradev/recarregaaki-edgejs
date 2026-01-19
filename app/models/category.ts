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

  static async findManyCategories(page: number, limit: number) {
    const categories = await this.query()
      .orderBy('createdAt', 'desc')
      .preload('refills')
      .paginate(page, limit)

    categories.baseUrl('/dashboard/categorias')
    return categories
  }

  static async findManyCategoriesByActive(isActive: boolean) {
    return await this.query()
      .where('isActive', isActive)
      .orderBy('createdAt', 'desc')
      .preload('refills')
  }

  static async findCategoryById(id: string) {
    return await this.query()
      .where('id', id)
      .preload('refills', (query) => query.orderBy('createdAt', 'desc'))
      .firstOrFail()
  }

  @beforeCreate()
  static assignUuid(category: Category) {
    category.id = randomUUID()
  }
}
