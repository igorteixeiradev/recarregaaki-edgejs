import Post from '#models/post'
import { CreatePostPayload, UpdatePostPayload } from '#validators/post'
import { unlink } from 'node:fs/promises'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import { type Authenticators } from '@adonisjs/auth/types'
import { type Authenticator } from '@adonisjs/auth'

export class PostService {
  async createPostAndUploadImage(
    payload: CreatePostPayload,
    auth: Authenticator<Authenticators>
  ): Promise<Post> {
    const { image, ...rest } = payload
    let imagePath: string | null = null

    if (image) {
      const fileName = `${cuid()}.${image.extname}`
      await image.move(app.makePath('uploads'), { name: fileName })
      imagePath = 'uploads/' + fileName
    }

    return await Post.create({ ...rest, image: imagePath, userId: auth.user?.id })
  }

  async updatePostAndUploadImage(id: string, payload: UpdatePostPayload): Promise<Post> {
    const post = await Post.findByOrFail('id', id)
    const { image, ...rest } = payload

    if (image) {
      if (post.image) {
        await unlink(post.image).catch(() => null)
      }
      const fileName = `${cuid()}.${image.extname}`
      await image.move(app.makePath('uploads'), { name: fileName })
      post.merge({ ...rest, image: 'uploads/' + fileName })
    } else {
      post.merge(rest)
    }

    await post.save()
    return post
  }

  async removePostAndRemoveImage(id: string): Promise<Post> {
    const post = await Post.findByOrFail('id', id)
    if (post.image) {
      await unlink(post.image).catch(() => null)
    }
    await post.delete()
    return post
  }
}
