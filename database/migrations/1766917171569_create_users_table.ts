import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.string('full_name').nullable()
      table.string('avatar_url').nullable()
      table.string('email', 254).notNullable().unique()
      table.string('password').notNullable()
      table.boolean('is_admin').defaultTo(false)
      table.string('phone_code', 10).defaultTo('+244')
      table.string('phone_number', 50).unique().nullable()
      table.boolean('verify_email').defaultTo(false)
      table.boolean('verify_phone_number').defaultTo(false)
      table.boolean('is_block').defaultTo(false)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
