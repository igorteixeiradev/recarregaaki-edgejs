import vine from '@vinejs/vine'
import type { Infer } from '@vinejs/vine/types'

/**
 * Registo público: o utilizador nunca escolhe permissões nem estados
 * (admin, bloqueado, email verificado...).
 */
export const registerValidator = vine.create({
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
})

export const loginValidator = vine.create({
  email: vine.string().trim().email().maxLength(254).normalizeEmail(),
  password: vine.string().minLength(8).maxLength(32),
})

/**
 * Não verificamos se o email existe: assim este formulário não serve para
 * descobrir quais os emails registados.
 */
export const forgotPasswordValidator = vine.create({
  email: vine.string().trim().email().maxLength(254).normalizeEmail(),
})

export const resetPasswordValidator = vine.create({
  token: vine.string().trim().minLength(1).maxLength(100),
  password: vine
    .string()
    .minLength(8)
    .maxLength(32)
    .confirmed({ confirmationField: 'passwordConfirmation' }),
})

export type RegisterPayload = Infer<typeof registerValidator>
