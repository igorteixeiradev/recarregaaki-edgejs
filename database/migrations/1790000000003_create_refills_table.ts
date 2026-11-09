import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'refills'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.string('name').notNullable()
      table.string('image').notNullable().defaultTo('images/not-content-image.png')
      table.text('description').notNullable()
      table.boolean('is_active').notNullable().defaultTo(true)
      table.string('other_name', 254).nullable().unique()
      // Não se apaga uma categoria que ainda tem recargas
      table
        .uuid('category_id')
        .notNullable()
        .references('id')
        .inTable('categories')
        .onDelete('RESTRICT')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
