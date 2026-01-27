import vine from '@vinejs/vine'
import { Infer } from '@vinejs/vine/types'

/**
 * Validador para criação de Post
 */
export const createPostValidator = vine.compile(
  vine.object({
    title: vine.string().minLength(3).maxLength(255),
    content: vine.string().minLength(2),
    image: vine
      .file({
        size: '2mb',
        extnames: ['jpg', 'png', 'jpeg'],
      })
      .optional(),
    isPublished: vine.boolean().optional(),
  })
)

/**
 * Validador para atualização de Post
 */
export const updatePostValidator = vine.compile(
  vine.object({
    title: vine.string().minLength(3).maxLength(255).optional(),
    content: vine.string().minLength(20).optional(),
    image: vine
      .file({
        size: '2mb',
        extnames: ['jpg', 'png', 'jpeg'],
      })
      .optional(),
    isPublished: vine.boolean().optional(),
  })
)

export type CreatePostPayload = Infer<typeof createPostValidator>
export type UpdatePostPayload = Infer<typeof updatePostValidator>
