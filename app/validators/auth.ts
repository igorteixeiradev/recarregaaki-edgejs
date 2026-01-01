import vine from '@vinejs/vine'
import { Infer } from '@vinejs/vine/types'

/**
 * Validates the email and password creation action
 */

export const createEmailAndPasswordValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email(),
    password: vine.string().trim().minLength(8).maxLength(32),
  })
)

export type CreateEmailAndPasswordPayload = Infer<typeof createEmailAndPasswordValidator>

/**
 * Validates the email creation action
 */

export const createEmailValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email(),
  })
)

export type CreateEmailPayload = Infer<typeof createEmailValidator>

/**
 * Validates the password creation action
 */

export const createPasswordValidator = vine.compile(
  vine.object({
    token: vine.string().trim().minLength(2).maxLength(100),
    password: vine.string().trim().minLength(8).maxLength(32),
    passwordConfirmation: vine.string().trim().minLength(8).maxLength(32).sameAs('password'),
  })
)

export type CreatePasswordPayload = Infer<typeof createPasswordValidator>
