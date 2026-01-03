import vine from '@vinejs/vine'
import { Infer } from '@vinejs/vine/types'

/**
 * Validates the refill's creation action
 */

export const createRefillValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(2).maxLength(255),
    image: vine.file({
      size: '2mb',
      extnames: ['jpg', 'png', 'jpeg'],
    }),
    description: vine.string().minLength(20),
    categoryId: vine
      .string()
      .minLength(2)
      .uuid()
      .exists(async (db, value) => {
        if (!value) return true

        return !!(await db.from('categories').where('id', value).first())
      }),
    isActive: vine.boolean().optional(),
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
        extnames: ['jpg', 'png', 'jpeg'],
      })
      .optional(),
    description: vine.string().optional(),
    categoryId: vine
      .string()
      .minLength(2)
      .uuid()
      .exists(async (db, value) => {
        if (!value) return true

        return !!(await db.from('categories').where('id', value).first())
      }),
    isActive: vine.boolean().optional(),
  })
)

export type CreateRefillPayload = Infer<typeof createRefillValidator>

export type UpdateRefillPayload = Infer<typeof updateRefillValidator>
