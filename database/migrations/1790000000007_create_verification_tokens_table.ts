import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'verification_tokens'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.string('email', 254).notNullable()
      // EMAIL_VERIFICATION | PASSWORD_RESET: um token nunca serve para o outro fluxo
      table.string('type', 30).notNullable()
      // sha256 do token enviado por email (o token em texto simples nunca é guardado)
      table.string('token', 64).notNullable().unique()
      table.timestamp('expires_at').notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
      table.index(['email', 'type'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
