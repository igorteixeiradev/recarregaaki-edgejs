import { inject } from '@adonisjs/core'
import Post from '#models/post'
import type User from '#models/user'
import ImageStorageService from '#services/image_storage_service'
import type { PageParams } from '#utils/pagination'
import type { CreatePostPayload, UpdatePostPayload } from '#validators/post'

@inject()
export default class PostService {
  constructor(protected images: ImageStorageService) {}

  /**
   * Listagem do painel: inclui rascunhos.
   */
  paginate({ page, limit }: PageParams) {
    return Post.query().preload('author').orderBy('createdAt', 'desc').paginate(page, limit)
  }

  findOrFail(id: string) {
    return Post.findOrFail(id)
  }

  /**
   * Blog público: apenas posts publicados.
   */
  paginatePublished({ page, limit }: PageParams) {
    return Post.query()
      .where('isPublished', true)
      .preload('author')
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)
  }

  findPublishedOrFail(id: string) {
    return Post.query().where('id', id).where('isPublished', true).preload('author').firstOrFail()
  }

  async create(author: User, { image, ...data }: CreatePostPayload) {
    const imagePath = image ? await this.images.store(image) : undefined

    // Sem imagem, a coluna usa o valor por defeito definido na migration
    return Post.create({ ...data, userId: author.id, ...(imagePath ? { image: imagePath } : {}) })
  }

  async update(post: Post, { image, ...data }: UpdatePostPayload) {
    post.merge(data)

    if (!image) {
      await post.save()
      return post
    }

    const previousImage = post.image
    post.image = await this.images.store(image)
    await post.save()
    await this.images.remove(previousImage)

    return post
  }

  async delete(post: Post) {
    await post.delete()
    await this.images.remove(post.image)
  }
}
