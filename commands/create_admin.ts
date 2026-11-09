import { args, BaseCommand, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import vine from '@vinejs/vine'

/**
 * Cria (ou promove) um administrador. Não existe registo público de admins:
 * é por aqui que se cria o primeiro.
 *
 *   node ace create:admin "Maria Silva" maria@exemplo.com
 */
export default class CreateAdmin extends BaseCommand {
  static commandName = 'create:admin'
  static description = 'Cria um utilizador administrador (ou promove um existente)'

  static options: CommandOptions = { startApp: true }

  @args.string({ description: 'Nome completo' })
  declare fullName: string

  @args.string({ description: 'Email do administrador' })
  declare email: string

  @flags.string({ description: 'Palavra-passe (se omitida, é pedida de forma segura)' })
  declare password?: string

  async run() {
    const { default: UserService } = await import('#services/user_service')
    const users = await this.app.container.make(UserService)

    const email = await vine.validate({
      schema: vine.string().trim().email().maxLength(254).normalizeEmail(),
      data: this.email,
    })

    const existing = await users.findByEmail(email)
    if (existing) {
      existing.isAdmin = true
      existing.isBlocked = false
      existing.isEmailVerified = true
      await existing.save()
      this.logger.success(`${email} já existia e foi promovido a administrador`)
      return
    }

    const password: string =
      this.password ??
      (await this.prompt.secure('Palavra-passe (mínimo 8 caracteres)', {
        validate: (value) => value.length >= 8 || 'Use pelo menos 8 caracteres',
      })) ??
      ''

    if (password.length < 8 || password.length > 32) {
      this.exitCode = 1
      this.logger.error('A palavra-passe deve ter entre 8 e 32 caracteres')
      return
    }

    const user = await users.create({ fullName: this.fullName, email, password, isAdmin: true })
    user.isEmailVerified = true
    await user.save()

    this.logger.success(`Administrador ${email} criado`)
  }
}
