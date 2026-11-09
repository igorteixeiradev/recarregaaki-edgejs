import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import CategoryService from '#services/category_service'
import PaymentService from '#services/payment_service'
import PostService from '#services/post_service'
import RefillService from '#services/refill_service'
import { pageParams } from '#utils/pagination'
import { testimonialSlides } from '#utils/testimonials'
import { urlFor } from '@adonisjs/core/services/url_builder'

@inject()
export default class PublicController {
  constructor(
    protected refills: RefillService,
    protected categories: CategoryService,
    protected posts: PostService,
    protected payments: PaymentService
  ) {}

  async home({ view }: HttpContext) {
    const refills = await this.refills.listFeatured()
    return view.render('pages/public/home', { refills, slides: testimonialSlides() })
  }

  async shop({ request, view }: HttpContext) {
    const [refills, categories] = await Promise.all([
      this.refills.catalog({
        ...pageParams(request, 12),
        text: request.input('q') ? String(request.input('q')) : undefined,
        categoryId: request.input('categoria') ? String(request.input('categoria')) : undefined,
      }),
      this.categories.listActive(),
    ])

    refills.baseUrl(urlFor('web.shop'))
    refills.queryString(request.qs())

    return view.render('pages/public/shop', {
      refills,
      categories,
      categoryId: String(request.input('categoria', '')),
    })
  }

  async show({ params, request, view }: HttpContext) {
    const refill = await this.refills.findPublicOrFail(params.id)

    // O pacote escolhido vem sempre da base de dados, nunca do pedido
    const selected = refill.packages.find((pkg) => pkg.id === request.input('selectItem'))

    return view.render('pages/public/show', {
      refill,
      selectedId: selected?.id ?? '',
      name: selected?.name ?? '',
      price: selected?.price ?? '',
    })
  }

  async blog({ request, view }: HttpContext) {
    const posts = await this.posts.paginatePublished(pageParams(request, 9))
    posts.baseUrl(urlFor('web.blog'))
    return view.render('pages/public/blog', { posts })
  }

  async showBlogPost({ params, view }: HttpContext) {
    const post = await this.posts.findPublishedOrFail(params.id)
    return view.render('pages/public/blog-details', { post })
  }

  async profile({ auth, request, view }: HttpContext) {
    const user = auth.getUserOrFail()
    const payments = await this.payments.paginateByUser(user.id, pageParams(request, 10))
    payments.baseUrl(urlFor('web.profile'))
    return view.render('pages/public/profile', { payments })
  }
}
