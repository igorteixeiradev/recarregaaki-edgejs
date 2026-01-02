import type { HttpContext } from '@adonisjs/core/http'
export default class PrivatesController {
  async index({ view }: HttpContext) {
    return view.render('pages/private/index')
  }
}
