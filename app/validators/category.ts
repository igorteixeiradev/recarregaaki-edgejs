import vine from '@vinejs/vine'
import type { Infer } from '@vinejs/vine/types'

export const createCategoryValidator = vine.create({
  name: vine
    .string()
    .trim()
    .minLength(1)
    .maxLength(254)
    .unique({ table: 'categories', column: 'name' }),
  isActive: vine.boolean().optional(),
})

/**
 * O `categoryId` nos metadados permite ignorar o próprio registo na unicidade.
 */
export const updateCategoryValidator = vine.withMetaData<{ categoryId: string }>().create({
  name: vine
    .string()
    .trim()
    .minLength(1)
    .maxLength(254)
    .unique(async (db, value, field) => {
      const row = await db
        .from('categories')
        .whereNot('id', field.meta.categoryId)
        .where('name', value)
        .select('id')
        .first()
      return !row
    })
    .optional(),
  isActive: vine.boolean().optional(),
})

export type CreateCategoryPayload = Infer<typeof createCategoryValidator>
export type UpdateCategoryPayload = Infer<typeof updateCategoryValidator>
