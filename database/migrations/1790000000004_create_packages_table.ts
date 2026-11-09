import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'packages'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.string('name').notNullable()
      table.decimal('price', 12, 2).notNullable()
      table.boolean('is_active').notNullable().defaultTo(false)
      table.boolean('is_special_offer').notNullable().defaultTo(false)
      table.string('other_name', 254).nullable().unique()
      table.uuid('refill_id').notNullable().references('id').inTable('refills').onDelete('CASCADE')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
