import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { urlFor } from '@adonisjs/core/services/url_builder'
import CategoryService from '#services/category_service'
import { notify } from '#utils/flash'
import { pageParams } from '#utils/pagination'
import { createCategoryValidator, updateCategoryValidator } from '#validators/category'

@inject()
export default class CategoriesController {
  constructor(protected categories: CategoryService) {}

  async index({ bouncer, request, view }: HttpContext) {
    await bouncer.with('CategoryPolicy').authorize('viewList')

    const categories = await this.categories.paginate(pageParams(request))
    categories.baseUrl(urlFor('categories.index'))

    return view.render('pages/private/categories/index', { categories })
  }

  async create({ bouncer, view }: HttpContext) {
    await bouncer.with('CategoryPolicy').authorize('create')
    return view.render('pages/private/categories/create')
  }

  async store({ bouncer, request, response, session }: HttpContext) {
    await bouncer.with('CategoryPolicy').authorize('create')

    const payload = await request.validateUsing(createCategoryValidator)
    await this.categories.create(payload)

    notify(session, 'success', 'Categoria adicionada com sucesso')
    return response.redirect().toRoute('categories.index')
  }

  async edit({ bouncer, params, view }: HttpContext) {
    await bouncer.with('CategoryPolicy').authorize('update')

    const category = await this.categories.findOrFail(params.id)
    return view.render('pages/private/categories/edit', { category })
  }

  async update({ bouncer, params, request, response, session }: HttpContext) {
    await bouncer.with('CategoryPolicy').authorize('update')

    const category = await this.categories.findOrFail(params.id)
    const payload = await request.validateUsing(updateCategoryValidator, {
      meta: { categoryId: category.id },
    })
    await this.categories.update(category, payload)

    notify(session, 'success', 'Categoria actualizada com sucesso')
    return response.redirect().toRoute('categories.index')
  }

  async destroy({ bouncer, params, response, session }: HttpContext) {
    await bouncer.with('CategoryPolicy').authorize('delete')

    const category = await this.categories.findOrFail(params.id)
    await this.categories.delete(category)

    notify(session, 'success', 'Categoria apagada com sucesso')
    return response.redirect().toRoute('categories.index')
  }
}
