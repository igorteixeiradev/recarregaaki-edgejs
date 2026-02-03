import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'payments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()

      table.uuid('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.uuid('package_id').unsigned().references('id').inTable('packages').onDelete('CASCADE')

      table.enum('status', ['PENDING', 'PAID', 'FAILED', 'CANCELED']).defaultTo('PENDING')
      table.decimal('amount', 8, 2).notNullable()
      table.string('method').nullable()
      table.string('reference').unique().nullable()
      table.timestamp('paid_at').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
