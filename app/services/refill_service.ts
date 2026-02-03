import Refill from '#models/refill'
import { CreateRefillPayload, UpdateRefillPayload } from '#validators/refill'
import { unlink } from 'node:fs/promises'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'

export class RefillService {
  async createRefillAndUploadImage(payload: CreateRefillPayload): Promise<Refill> {
    const { image, ...rest } = payload
    if (image) {
      const fileName = `${cuid()}.${image.extname}`
      await image.move(app.makePath('uploads'), {
        name: fileName,
      })
      return await Refill.create({ ...rest, image: 'uploads/' + fileName })
    }
    return await Refill.create({ ...rest })
  }

  async updateRefillAndUploadImage(id: string, payload: UpdateRefillPayload): Promise<Refill> {
    const refill = await Refill.findByOrFail('id', id)

    const { image, ...rest } = payload

    const defaultImage = 'images/not-content-image.png'

    if (image) {
      if (refill.image !== defaultImage) {
        await unlink(refill.image)
      }
      const fileName = `${cuid()}.${image.extname}`
      await image.move(app.makePath('uploads'), {
        name: fileName,
      })
      refill.merge({ ...rest, image: 'uploads/' + fileName })
    } else {
      refill.merge(rest)
    }

    await refill.save()

    return refill
  }

  async removeRefillAndRemoveImage(id: string): Promise<Refill> {
    const refill = await Refill.findByOrFail('id', id)
    const defaultImage = 'images/not-content-image.png'
    if (refill.image !== defaultImage) {
      await unlink(refill.image)
    }
    await refill.delete()
    return refill
  }
}
