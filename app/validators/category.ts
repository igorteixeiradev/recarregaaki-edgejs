import vine from '@vinejs/vine'

/**
 * Validates the category's creation action
 */

export const createCategoryValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(1).maxLength(254).unique({ table: 'categories', column: 'name' }),
    isActive: vine.boolean().optional(),
  })
)
/**
 * Validates the category's update action
 */
export const updateCategoryValidator = vine.compile(
  vine.object({
    name: vine.string().maxLength(254).optional(),
    isActive: vine.boolean().optional(),
  })
)
