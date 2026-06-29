import Category from '#models/category'
import Payment from '#models/payment'
import Post from '#models/post'
import Refill from '#models/refill'
import type { HttpContext } from '@adonisjs/core/http'
const comments = [
  {
    name: 'Herman Bartolomeu',
    title: 'Jogador Clash of Clans',
    image: '/clients/herman-bartolomeu.jpeg',
    comment: 'A plataforma é incrível! Fiz minha recarga em segundos e sem problemas.',
  },
  {
    name: 'Igor Teixeira',
    title: 'Jogador de Delta Force',
    image: '/clients/igor-teixeira.jpeg',
    comment: 'Super rápido e confiável. Recomendo para todos que jogam online.',
  },
  {
    name: 'Ricardo Ramalhoso',
    title: 'Jogador de Clash Royale',
    image: '/clients/ricardo-ramalhoso.jpeg',
    comment: 'Excelente serviço. As recargas chegam instantaneamente e o suporte é top.',
  },
]
export default class PublicsController {
  async index({ view }: HttpContext) {
    const slides = []
    for (let i = 0; i < comments.length; i += 2) {
      slides.push(comments.slice(i, i + 2))
    }
    const refills = await Refill.query()
      .has('packages')
      .where('isActive', true)
      .orderBy('createdAt', 'desc')
      .preload('category')

    return view.render('pages/public/home', { refills, slides })
  }

  async shop({ view, request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const text = request.input('q', '')
    const categoryId = request.input('categoria', '')
    const [categories, refills] = await Promise.all([
      Category.findManyBy('isActive', true),
      Refill.findManyRefillsByQ(page, limit, text, categoryId),
    ])

    return view.render('pages/public/shop', { categories, refills, categoryId })
  }

  async show({ params, view, request }: HttpContext) {
    const selectedId = request.input('selectItem', '')
    const name = request.input('name', '')
    const price = request.input('price', '')
    const refill = await Refill.query()
      .where('id', params.id)
      .preload('category')
      .preload('packages', (query) => {
        query.orderBy('price', 'asc')
      })
      .firstOrFail()
    return view.render('pages/public/show', { refill, selectedId, name, price })
  }

  async blog({ view, request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const posts = await Post.query()
      .preload('author')
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)
    posts.baseUrl('/blog')
    return view.render('pages/public/blog', { posts })
  }

  async showBlogPost({ view, params }: HttpContext) {
    const post = await Post.query().preload('author').where('id', params.id).firstOrFail()
    return view.render('pages/public/blog-details', { post })
  }

  async profile({ view, auth, request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)

    const payments = await Payment.query()
      .where('userId', auth.user!.id)
      .preload('package')
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)

    payments.baseUrl('/perfil')

    return view.render('pages/public/profile', { payments })
  }
}
