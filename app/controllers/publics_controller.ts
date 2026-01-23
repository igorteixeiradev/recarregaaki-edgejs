import Category from '#models/category'
import Refill from '#models/refill'
import type { HttpContext } from '@adonisjs/core/http'

export default class PublicsController {
  async index({ view }: HttpContext) {
    const refills = await Refill.findManyRefillByIsActive(true)
    return view.render('pages/public/home', { refills })
  }
  async shop({ view, request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const text = request.input('text', '')
    const categoryId = request.input('categoria', '')
    const categories = await Category.findManyCategoriesByActive(true)
    const refills = await Refill.findManyRefillsBySearchTerm(page, limit, text, categoryId)
    return view.render('pages/public/shop', { categories, refills, categoryId })
  }
  async show({ params, view, request }: HttpContext) {
    const selectedId = request.input('selectItem', '')
    const name = request.input('name', '')
    const price = request.input('price', '')
    const refill = await Refill.findRefillById(params.id)
    return view.render('pages/public/show', { refill, selectedId, name, price })
  }
}
