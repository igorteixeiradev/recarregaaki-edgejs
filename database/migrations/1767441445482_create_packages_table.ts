import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'packages'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('refill_id').notNullable().references('id').inTable('refills').onDelete('CASCADE')
      table.string('name', 254).notNullable()
      table.decimal('price', 8, 2).notNullable()
      table.boolean('is_active').defaultTo(false)
      table.boolean('is_special_offer').defaultTo(false)
      table.string('other_name', 254).unique().nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
