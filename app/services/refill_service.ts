import { inject } from '@adonisjs/core'
import Refill from '#models/refill'
import ImageStorageService from '#services/image_storage_service'
import { escapeLike, likeEscapeClause } from '#utils/sql'
import { isUuid } from '#utils/uuid'
import type { PageParams } from '#utils/pagination'
import type { CreateRefillPayload, UpdateRefillPayload } from '#validators/refill'

export type CatalogFilters = PageParams & {
  text?: string
  categoryId?: string
}

@inject()
export default class RefillService {
  constructor(protected images: ImageStorageService) {}

  /**
   * Listagem do painel: todas as recargas, activas ou não.
   */
  paginate({ page, limit }: PageParams) {
    return Refill.query()
      .orderBy('createdAt', 'desc')
      .preload('category')
      .preload('packages')
      .paginate(page, limit)
  }

  findOrFail(id: string) {
    return Refill.findOrFail(id)
  }

  /**
   * Recargas visíveis na loja: activas e com pelo menos um pacote activo.
   */
  #publicQuery() {
    return Refill.query()
      .where('isActive', true)
      .whereHas('packages', (packages) => packages.where('isActive', true))
  }

  /**
   * Destaques da página inicial.
   */
  listFeatured() {
    return this.#publicQuery().orderBy('createdAt', 'desc').preload('category')
  }

  /**
   * Pesquisa paginada da loja, por texto e/ou categoria.
   */
  catalog({ page, limit, text, categoryId }: CatalogFilters) {
    const query = this.#publicQuery().orderBy('createdAt', 'desc').preload('category')

    if (text) {
      const pattern = `%${escapeLike(text)}%`
      // Os OR ficam agrupados para não 'vazarem' para os outros filtros
      query.where((builder) => {
        builder
          .whereRaw(`name LIKE ? ${likeEscapeClause}`, [pattern])
          .orWhereRaw(`description LIKE ? ${likeEscapeClause}`, [pattern])
      })
    }

    if (isUuid(categoryId)) {
      query.where('categoryId', categoryId)
    }

    return query.paginate(page, limit)
  }

  /**
   * Detalhe público: só recargas activas e só os pacotes activos.
   */
  findPublicOrFail(id: string) {
    return Refill.query()
      .where('id', id)
      .where('isActive', true)
      .preload('category')
      .preload('packages', (packages) => {
        packages.where('isActive', true).orderBy('price', 'asc')
      })
      .firstOrFail()
  }

  async create({ image, ...data }: CreateRefillPayload) {
    const imagePath = image ? await this.images.store(image) : undefined

    // Sem imagem, a coluna usa o valor por defeito definido na migration
    return Refill.create(imagePath ? { ...data, image: imagePath } : data)
  }

  async update(refill: Refill, { image, ...data }: UpdateRefillPayload) {
    refill.merge(data)

    if (!image) {
      await refill.save()
      return refill
    }

    const previousImage = refill.image
    refill.image = await this.images.store(image)
    await refill.save()
    await this.images.remove(previousImage)

    return refill
  }

  async delete(refill: Refill) {
    await refill.delete()
    await this.images.remove(refill.image)
  }
}
