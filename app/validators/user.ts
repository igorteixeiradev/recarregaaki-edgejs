import vine from '@vinejs/vine'
import { Infer } from '@vinejs/vine/types'

/**
 * Validates the user's creation action
 */
export const createUserValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(3).maxLength(254),
    email: vine
      .string()
      .trim()
      .email()
      .unique({ table: 'users', column: 'email' })
      .normalizeEmail(),
    password: vine.string().trim().minLength(8).maxLength(32),
    passwordConfirmation: vine.string().trim().minLength(8).maxLength(32).sameAs('password'),
    avatarUrl: vine.string().optional(),
    isAdmin: vine.boolean().optional(),
    phoneCode: vine.string().maxLength(5).optional(),
    phoneNumber: vine.string().maxLength(20).optional(),
    isEmailVerified: vine.boolean().optional(),
    isPhoneVerified: vine.boolean().optional(),
    isBlocked: vine.boolean().optional(),
  })
)

/**
 * Validates the user's update action
 */
export const updateUserValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().maxLength(254).optional(),
    email: vine
      .string()
      .trim()
      .email()
      .maxLength(254)
      .exists({ table: 'users', column: 'email' })
      .normalizeEmail()
      .optional(),
    avatarUrl: vine.string().url().optional(),
    isAdmin: vine.boolean().optional(),
    password: vine.string().trim().minLength(8).maxLength(32),
    phoneCode: vine.string().startsWith('+').maxLength(5).optional(),
    phoneNumber: vine.string().maxLength(20).optional(),
    isEmailVerified: vine.boolean().optional(),
    isPhoneVerified: vine.boolean().optional(),
    isBlocked: vine.boolean().optional(),
  })
)

export type CreateUserPayload = Infer<typeof createUserValidator>
export type UpdateUserPayload = Infer<typeof updateUserValidator>
