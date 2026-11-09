import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.string('full_name').nullable()
      table.string('email', 254).notNullable().unique()
      table.text('avatar_url').nullable()
      table.boolean('is_admin').notNullable().defaultTo(false)
      table.string('phone_code', 5).notNullable().defaultTo('+244')
      table.string('phone_number', 20).nullable().unique()
      table.boolean('is_email_verified').notNullable().defaultTo(false)
      table.boolean('is_phone_verified').notNullable().defaultTo(false)
      table.boolean('is_blocked').notNullable().defaultTo(false)
      table.string('password').notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
