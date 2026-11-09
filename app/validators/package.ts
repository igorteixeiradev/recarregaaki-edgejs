import vine from '@vinejs/vine'
import type { Infer } from '@vinejs/vine/types'

/**
 * O `refillId` é sempre o da rota (ver PackagesController), nunca o do corpo do pedido.
 */
export const createPackageValidator = vine.create({
  name: vine.string().trim().minLength(1).maxLength(254),
  price: vine.number().min(0).decimal([0, 2]),
  refillId: vine.string().uuid().exists({ table: 'refills', column: 'id' }),
  isActive: vine.boolean().optional(),
  isSpecialOffer: vine.boolean().optional(),
  otherName: vine
    .string()
    .trim()
    .maxLength(254)
    .unique({ table: 'packages', column: 'other_name' })
    .optional(),
})

export const updatePackageValidator = vine.withMetaData<{ packageId: string }>().create({
  name: vine.string().trim().minLength(1).maxLength(254).optional(),
  price: vine.number().min(0).decimal([0, 2]).optional(),
  isActive: vine.boolean().optional(),
  isSpecialOffer: vine.boolean().optional(),
  otherName: vine
    .string()
    .trim()
    .maxLength(254)
    .unique(async (db, value, field) => {
      const row = await db
        .from('packages')
        .whereNot('id', field.meta.packageId)
        .where('other_name', value)
        .select('id')
        .first()
      return !row
    })
    .optional(),
})

export type CreatePackagePayload = Infer<typeof createPackageValidator>
export type UpdatePackagePayload = Infer<typeof updatePackageValidator>
