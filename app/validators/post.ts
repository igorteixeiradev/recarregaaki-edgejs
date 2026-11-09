import vine from '@vinejs/vine'
import type { Infer } from '@vinejs/vine/types'
import { imageRules } from '#validators/image_rules'

export const createPostValidator = vine.create({
  title: vine.string().trim().minLength(1).maxLength(254),
  content: vine.string().trim().minLength(2),
  image: vine.file(imageRules).optional(),
  isPublished: vine.boolean().optional(),
})

export const updatePostValidator = vine.create({
  title: vine.string().trim().minLength(1).maxLength(254).optional(),
  content: vine.string().trim().minLength(2).optional(),
  image: vine.file(imageRules).optional(),
  isPublished: vine.boolean().optional(),
})

export type CreatePostPayload = Infer<typeof createPostValidator>
export type UpdatePostPayload = Infer<typeof updatePostValidator>
