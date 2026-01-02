import vine from '@vinejs/vine'

/**
 * Validates the category's creation action
 */

export const createCategoryValidator = vine.compile(
  vine.object({
    name: vine
      .string()
      .minLength(2)
      .maxLength(255)
      .unique(async (db, value) => {
        const category = await db.from('categories').where('name', value).first()
        return !category
      }),
    isActive: vine.boolean().optional(),
  })
)

/**
 * Validates the category's update action
 */
export const updateCategoryValidator = vine.compile(
  vine.object({
    name: vine
      .string()
      .exists(async (db, value) => {
        if (!value) return true

        return !!(await db.from('categories').where('name', value).first())
      })
      .optional(),
    isActive: vine.boolean().optional(),
  })
)
