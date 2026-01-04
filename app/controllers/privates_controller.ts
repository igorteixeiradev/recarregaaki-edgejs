import Package from '#models/package'
import Refill from '#models/refill'
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
export default class PrivatesController {
  async index({ view }: HttpContext) {
    const users = await User.all()
    const refills = await Refill.all()
    const packages = await Package.all()

    return view.render('pages/private/index', { users, refills, packages })
  }
}
