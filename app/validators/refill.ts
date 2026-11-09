import vine from '@vinejs/vine'
import type { Infer } from '@vinejs/vine/types'
import { imageRules } from '#validators/image_rules'

export const createRefillValidator = vine.create({
  name: vine.string().trim().minLength(1).maxLength(255),
  image: vine.file(imageRules).optional(),
  description: vine.string().trim().minLength(20),
  categoryId: vine.string().uuid().exists({ table: 'categories', column: 'id' }),
  isActive: vine.boolean().optional(),
  otherName: vine
    .string()
    .trim()
    .maxLength(254)
    .unique({ table: 'refills', column: 'other_name' })
    .optional(),
})

export const updateRefillValidator = vine.withMetaData<{ refillId: string }>().create({
  name: vine.string().trim().minLength(1).maxLength(255).optional(),
  image: vine.file(imageRules).optional(),
  description: vine.string().trim().minLength(20).optional(),
  categoryId: vine.string().uuid().exists({ table: 'categories', column: 'id' }).optional(),
  isActive: vine.boolean().optional(),
  otherName: vine
    .string()
    .trim()
    .maxLength(254)
    .unique(async (db, value, field) => {
      const row = await db
        .from('refills')
        .whereNot('id', field.meta.refillId)
        .where('other_name', value)
        .select('id')
        .first()
      return !row
    })
    .optional(),
})

export type CreateRefillPayload = Infer<typeof createRefillValidator>
export type UpdateRefillPayload = Infer<typeof updateRefillValidator>
