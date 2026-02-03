import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'refills'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()

      table
        .uuid('category_id')
        .notNullable()
        .references('id')
        .inTable('categories')
        .onDelete('CASCADE')

      table.string('name', 254).notNullable()
      table.text('description').notNullable()
      table.string('image', 500).notNullable().defaultTo('images/not-content-image.png')
      table.boolean('is_active').defaultTo(true)
      table.string('other_name', 254).unique().nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
