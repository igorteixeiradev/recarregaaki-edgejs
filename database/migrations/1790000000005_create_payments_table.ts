import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'payments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      // RESTRICT: o histórico financeiro nunca é apagado em cascata
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('RESTRICT')
      table
        .uuid('package_id')
        .notNullable()
        .references('id')
        .inTable('packages')
        .onDelete('RESTRICT')
      table.string('method').nullable()
      table.string('reference').nullable()
      table.decimal('amount', 12, 2).notNullable()
      table.timestamp('paid_at').nullable()
      table
        .enum('status', ['PENDING', 'PAID', 'FAILED', 'CANCELED'])
        .notNullable()
        .defaultTo('PENDING')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
