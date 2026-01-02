import Category from '#models/category'
import { createCategoryValidator, updateCategoryValidator } from '#validators/category'
import type { HttpContext } from '@adonisjs/core/http'

export default class CategoriesController {
  /**
   * Display a list of resource
   */
  async index({ request, view }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const categories = await Category.findManyCategories(page, limit)
    return view.render('pages/private/categories/index', { categories })
  }

  /**
   * Display form to create a new record
   */
  async create({ view }: HttpContext) {
    return view.render('pages/private/categories/create')
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request }: HttpContext) {
    const payload = await request.validateUsing(createCategoryValidator)
    await Category.create(payload)

    request.ctx?.session.flash('notification', {
      type: 'success',
      message: 'Categoria adicionada com sucesso',
    })

    return request.ctx?.response.redirect().toRoute('categories.index')
  }

  /**
   * Show individual record
   */
  async show({ params }: HttpContext) {
    return await Category.findCategoryById(params.id)
  }

  /**
   * Edit individual record
   */
  async edit({ params, view }: HttpContext) {
    const category = await Category.findCategoryById(params.id)
    return view.render('pages/private/categories/edit', { category })
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request }: HttpContext) {
    const payload = await request.validateUsing(updateCategoryValidator)
    const category = await Category.findByOrFail('id', params.id)
    category.merge(payload)
    await category.save()

    request.ctx?.session.flash('notification', {
      type: 'success',
      message: 'Categoria actualizada com sucesso',
    })

    return request.ctx?.response.redirect().toRoute('categories.index')
  }

  /**
   * Delete record
   */
  async destroy({ params, response }: HttpContext) {
    const category = await Category.findByOrFail('id', params.id)
    await category.delete()
    return response.redirect().toRoute('categories.index')
  }
}
