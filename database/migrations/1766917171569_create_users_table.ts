import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.string('full_name', 254).nullable()
      table.text('avatar_url').nullable()
      table.string('email', 254).notNullable().unique()
      table.string('password', 254).notNullable()
      table.boolean('is_admin').defaultTo(false)
      table.string('phone_code', 5).defaultTo('+244')
      table.string('phone_number', 20).unique().nullable()
      table.boolean('is_email_verified').defaultTo(false)
      table.boolean('is_phone_verified').defaultTo(false)
      table.boolean('is_blocked').defaultTo(false)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
