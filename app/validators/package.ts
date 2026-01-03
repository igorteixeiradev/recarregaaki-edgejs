import vine from '@vinejs/vine'

/**
 * Validates the package's creation action
 */
export const createPackageValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(1).maxLength(100),
    price: vine.number().decimal([0, 2]),
    refillId: vine
      .string()
      .uuid()
      .exists(async (db, value) => {
        if (value) {
          const refill = await db.from('refills').where('id', value).first()
          return !!refill
        }
        return true
      }),
    isActive: vine.boolean(),
    isSpecialOffer: vine.boolean().optional(),
  })
)

/**
 * Validates the package's update action
 */
export const updatePackageValidator = vine.compile(
  vine.object({
    name: vine.string().optional(),
    price: vine.number().decimal([0, 2]).optional(),
    refillId: vine
      .string()
      .uuid()
      .exists(async (db, value) => {
        if (value) {
          const refill = await db.from('refills').where('id', value).first()
          return !!refill
        }
        return true
      })
      .optional(),
    isActive: vine.boolean().optional(),
    isSpecialOffer: vine.boolean().optional(),
  })
)
