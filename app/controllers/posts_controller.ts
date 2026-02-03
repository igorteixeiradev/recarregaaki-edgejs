import { isAdmin } from '#abilities/main'
import Post from '#models/post'
import { PostService } from '#services/post_service'
import { createPostValidator, updatePostValidator } from '#validators/post'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class PostsController {
  constructor(protected postService: PostService) {}
  /**
   * Display a list of resource
   */
  async index({ request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const posts = await Post.query().preload('author').paginate(page, limit)
    posts.baseUrl('/dashboard/blog')
    if (await request.ctx?.bouncer.denies(isAdmin)) {
      return request.ctx?.response.forbidden()
    }
    return request.ctx?.view.render('pages/private/blog/index', { posts })
  }

  /**
   * Display form to create a new record
   */
  async create({ request }: HttpContext) {
    return request.ctx?.view.render('pages/private/blog/create')
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, auth }: HttpContext) {
    const payload = await request.validateUsing(createPostValidator)
    if (await request.ctx?.bouncer.denies(isAdmin)) {
      return request.ctx?.response.forbidden()
    }
    await this.postService.createPostAndUploadImage(payload, auth)
    request.ctx?.session.flash('notification', {
      type: 'success',
      message: 'Post adicionado com sucesso',
    })
    return request.ctx?.response.redirect().toRoute('blog.index')
  }

  /**
   * Show individual record
   */
  async show({ params }: HttpContext) {
    return await Post.findOrFail(params.id)
  }

  /**
   * Edit individual record
   */
  async edit({ params, request }: HttpContext) {
    const post = await Post.findOrFail(params.id)
    return request.ctx?.view.render('pages/private/blog/edit', { post })
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request }: HttpContext) {
    const post = await Post.findOrFail(params.id)
    const payload = await request.validateUsing(updatePostValidator)
    if (await request.ctx?.bouncer.denies(isAdmin)) {
      return request.ctx?.response.forbidden()
    }
    await this.postService.updatePostAndUploadImage(post.id, payload)
    request.ctx?.session.flash('notification', {
      type: 'success',
      message: 'Post actualizada com sucesso',
    })
    return request.ctx?.response.redirect().toRoute('blog.index')
  }

  /**
   * Delete record
   */
  async destroy({ params, request }: HttpContext) {
    const post = await Post.findOrFail(params.id)
    if (await request.ctx?.bouncer.denies(isAdmin)) {
      return request.ctx?.response.forbidden()
    }
    await this.postService.removePostAndRemoveImage(post.id)
    request.ctx?.session.flash('notification', {
      type: 'success',
      message: 'Post apagado com sucesso',
    })
    return request.ctx?.response.redirect().toRoute('blog.index')
  }
}
