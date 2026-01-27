import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'posts'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.string('title', 255).notNullable()
      table.text('content').notNullable()
      table.text('image').nullable()
      table.boolean('is_published').defaultTo(false)
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
