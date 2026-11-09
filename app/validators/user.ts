import vine from '@vinejs/vine'
import type { Infer } from '@vinejs/vine/types'

/**
 * Criação de utilizadores pelo administrador.
 */
export const createUserValidator = vine.create({
  fullName: vine.string().trim().minLength(3).maxLength(254),
  email: vine
    .string()
    .trim()
    .email()
    .maxLength(254)
    .normalizeEmail()
    .unique({ table: 'users', column: 'email' }),
  password: vine
    .string()
    .minLength(8)
    .maxLength(32)
    .confirmed({ confirmationField: 'passwordConfirmation' }),
  isAdmin: vine.boolean().optional(),
  phoneCode: vine.string().startsWith('+').maxLength(5).optional(),
  phoneNumber: vine
    .string()
    .trim()
    .maxLength(20)
    .unique({ table: 'users', column: 'phone_number' })
    .optional(),
  isEmailVerified: vine.boolean().optional(),
  isPhoneVerified: vine.boolean().optional(),
  isBlocked: vine.boolean().optional(),
})

/**
 * Atualização: a palavra-passe é opcional e a unicidade ignora o próprio utilizador.
 */
export const updateUserValidator = vine.withMetaData<{ userId: string }>().create({
  fullName: vine.string().trim().minLength(3).maxLength(254).optional(),
  email: vine
    .string()
    .trim()
    .email()
    .maxLength(254)
    .normalizeEmail()
    .unique(async (db, value, field) => {
      const row = await db
        .from('users')
        .whereNot('id', field.meta.userId)
        .where('email', value)
        .select('id')
        .first()
      return !row
    })
    .optional(),
  password: vine.string().minLength(8).maxLength(32).optional(),
  isAdmin: vine.boolean().optional(),
  phoneCode: vine.string().startsWith('+').maxLength(5).optional(),
  phoneNumber: vine
    .string()
    .trim()
    .maxLength(20)
    .unique(async (db, value, field) => {
      const row = await db
        .from('users')
        .whereNot('id', field.meta.userId)
        .where('phone_number', value)
        .select('id')
        .first()
      return !row
    })
    .optional(),
  isEmailVerified: vine.boolean().optional(),
  isPhoneVerified: vine.boolean().optional(),
  isBlocked: vine.boolean().optional(),
})

export type CreateUserPayload = Infer<typeof createUserValidator>
export type UpdateUserPayload = Infer<typeof updateUserValidator>
