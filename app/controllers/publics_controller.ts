import Category from '#models/category'
import Post from '#models/post'
import Refill from '#models/refill'
import type { HttpContext } from '@adonisjs/core/http'

export default class PublicsController {
  async index({ view }: HttpContext) {
    const comments = [
      {
        name: 'Herman Bartolomeu',
        title: 'Jogador Clash of Clans',
        image: '/usr/herman-bartolomeu.jpeg',
        comment: 'A plataforma é incrível! Fiz minha recarga em segundos e sem problemas.',
      },
      {
        name: 'Igor Teixeira',
        title: 'Jogador de Delta Force',
        image: '/usr/igor-teixeira.jpeg',
        comment: 'Super rápido e confiável. Recomendo para todos que jogam online.',
      },
      {
        name: 'Ricardo Ramalhoso',
        title: 'Jogador de Clash Royale',
        image: '/usr/ricardo-ramalhoso.jpeg',
        comment: 'Excelente serviço. As recargas chegam instantaneamente e o suporte é top.',
      },
      {
        name: 'Mariana Silva',
        title: 'Jogadora Free Fire',
        image: '/usr/mariana-silva.jpeg',
        comment: 'Muito prática e segura! Sempre uso para minhas recargas de jogos.',
      },
      {
        name: 'Carlos Mendes',
        title: 'Jogador de PUBG Mobile',
        image: '/usr/carlos-mendes.jpeg',
        comment: 'O processo é simples e rápido. Nunca tive problemas com pagamentos.',
      },
      {
        name: 'Ana Costa',
        title: 'Jogadora Fortnite',
        image: '/usr/ana-costa.jpeg',
        comment: 'A plataforma é confiável e sempre entrega a recarga na hora certa.',
      },
    ]
    const slides = []
    for (let i = 0; i < comments.length; i += 2) {
      slides.push(comments.slice(i, i + 2))
    }
    const refills = await Refill.findManyRefillByIsActive(true)

    return view.render('pages/public/home', { refills, slides })
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
  async show({ params, view, request }: HttpContext) {
    const selectedId = request.input('selectItem', '')
    const name = request.input('name', '')
    const price = request.input('price', '')
    const refill = await Refill.findRefillById(params.id)
    return view.render('pages/public/show', { refill, selectedId, name, price })
  }
}
