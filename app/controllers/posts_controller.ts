import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { urlFor } from '@adonisjs/core/services/url_builder'
import PostService from '#services/post_service'
import { notify } from '#utils/flash'
import { pageParams } from '#utils/pagination'
import { createPostValidator, updatePostValidator } from '#validators/post'

@inject()
export default class PostsController {
  constructor(protected posts: PostService) {}

  async index({ bouncer, request, view }: HttpContext) {
    await bouncer.with('PostPolicy').authorize('viewList')

    const posts = await this.posts.paginate(pageParams(request))
    posts.baseUrl(urlFor('blog.index'))

    return view.render('pages/private/blog/index', { posts })
  }

  async create({ bouncer, view }: HttpContext) {
    await bouncer.with('PostPolicy').authorize('create')
    return view.render('pages/private/blog/create')
  }

  async store({ auth, bouncer, request, response, session }: HttpContext) {
    await bouncer.with('PostPolicy').authorize('create')

    const payload = await request.validateUsing(createPostValidator)
    await this.posts.create(auth.getUserOrFail(), payload)

    notify(session, 'success', 'Post adicionado com sucesso')
    return response.redirect().toRoute('blog.index')
  }

  async edit({ bouncer, params, view }: HttpContext) {
    await bouncer.with('PostPolicy').authorize('update')

    const post = await this.posts.findOrFail(params.id)
    return view.render('pages/private/blog/edit', { post })
  }

  async update({ bouncer, params, request, response, session }: HttpContext) {
    await bouncer.with('PostPolicy').authorize('update')

    const post = await this.posts.findOrFail(params.id)
    const payload = await request.validateUsing(updatePostValidator)
    await this.posts.update(post, payload)

    notify(session, 'success', 'Post actualizado com sucesso')
    return response.redirect().toRoute('blog.index')
  }

  async destroy({ bouncer, params, response, session }: HttpContext) {
    await bouncer.with('PostPolicy').authorize('delete')

    const post = await this.posts.findOrFail(params.id)
    await this.posts.delete(post)

    notify(session, 'success', 'Post apagado com sucesso')
    return response.redirect().toRoute('blog.index')
  }
}
