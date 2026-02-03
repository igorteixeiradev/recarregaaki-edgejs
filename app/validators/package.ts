import vine from '@vinejs/vine'

/**
 * Validates the package's creation action
 */
export const createPackageValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(1).maxLength(254),
    price: vine.number().decimal([0, 2]),
    refillId: vine.string().minLength(1).uuid().exists({ table: 'refills', column: 'id' }),
    isActive: vine.boolean().optional(),
    isSpecialOffer: vine.boolean().optional(),
    otherName: vine.string().maxLength(254).optional(),
  })
)

/**
 * Validates the package's update action
 */
export const updatePackageValidator = vine.compile(
  vine.object({
    name: vine.string().optional(),
    price: vine.number().decimal([0, 2]).optional(),
    refillId: vine.string().uuid().exists({ table: 'refills', column: 'id' }).optional(),
    isActive: vine.boolean().optional(),
    isSpecialOffer: vine.boolean().optional(),
    otherName: vine.string().maxLength(254).optional(),
  })
)
