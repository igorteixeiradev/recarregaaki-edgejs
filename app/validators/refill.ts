import vine from '@vinejs/vine'
import { Infer } from '@vinejs/vine/types'

/**
 * Validates the refill's creation action
 */

export const createRefillValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(1).maxLength(255),
    image: vine
      .file({
        size: '2mb',
        extnames: ['jpg', 'jpeg', 'png', 'webp', 'svg'],
      })
      .optional(),
    description: vine.string().minLength(20),
    categoryId: vine.string().minLength(1).uuid().exists({ table: 'categories', column: 'id' }),
    isActive: vine.boolean().optional(),
    otherName: vine.string().maxLength(254).optional(),
  })
)

/**
 * Validates the refill's update action
 */
export const updateRefillValidator = vine.compile(
  vine.object({
    name: vine.string().optional(),
    image: vine
      .file({
        size: '2mb',
        extnames: ['jpg', 'jpeg', 'png', 'webp', 'svg'],
      })
      .optional(),
    description: vine.string().optional(),
    categoryId: vine.string().uuid().exists({ table: 'categories', column: 'id' }).optional(),
    isActive: vine.boolean().optional(),
    otherName: vine.string().maxLength(254).optional(),
  })
)

export type CreateRefillPayload = Infer<typeof createRefillValidator>
export type UpdateRefillPayload = Infer<typeof updateRefillValidator>
