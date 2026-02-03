import vine from '@vinejs/vine'
import { Infer } from '@vinejs/vine/types'

/**
 * Validador para criação de Post
 */
export const createPostValidator = vine.compile(
  vine.object({
    title: vine.string().minLength(1).maxLength(254),
    content: vine.string().minLength(2),
    image: vine
      .file({
        size: '2mb',
        extnames: ['jpg', 'jpeg', 'png', 'webp', 'svg'],
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
    title: vine.string().minLength(1).maxLength(254).optional(),
    content: vine.string().optional(),
    image: vine
      .file({
        size: '2mb',
        extnames: ['jpg', 'jpeg', 'png', 'webp', 'svg'],
      })
      .optional(),
    isPublished: vine.boolean().optional(),
  })
)

export type CreatePostPayload = Infer<typeof createPostValidator>
export type UpdatePostPayload = Infer<typeof updatePostValidator>
