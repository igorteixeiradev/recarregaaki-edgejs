import Category from '#models/category'
import type { PageParams } from '#utils/pagination'

export default class CategoryService {
  paginate({ page, limit }: PageParams) {
    return Category.query().orderBy('createdAt', 'desc').preload('refills').paginate(page, limit)
  }

  listActive() {
    return Category.query().where('isActive', true).orderBy('name', 'asc')
  }

  /**
   * Todas as categorias (para os formulários do painel).
   */
  listAll() {
    return Category.query().orderBy('name', 'asc')
  }

  findOrFail(id: string) {
    return Category.findOrFail(id)
  }

  create(payload: { name: string; isActive?: boolean }) {
    return Category.create(payload)
  }

  async update(category: Category, payload: { name?: string; isActive?: boolean }) {
    category.merge(payload)
    await category.save()
    return category
  }

  async delete(category: Category) {
    await category.delete()
  }
}
