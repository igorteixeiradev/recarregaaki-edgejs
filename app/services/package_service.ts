import Package from '#models/package'
import type Refill from '#models/refill'
import type { PageParams } from '#utils/pagination'
import type { CreatePackagePayload, UpdatePackagePayload } from '#validators/package'

export default class PackageService {
  paginateByRefill(refill: Refill, { page, limit }: PageParams) {
    return Package.query()
      .where('refillId', refill.id)
      .orderBy('createdAt', 'desc')
      .preload('refill')
      .paginate(page, limit)
  }

  /**
   * Garante que o pacote pertence mesmo à recarga indicada na rota.
   */
  findForRefillOrFail(refillId: string, packageId: string) {
    return Package.query().where('id', packageId).where('refillId', refillId).firstOrFail()
  }

  create(payload: CreatePackagePayload) {
    return Package.create(payload)
  }

  async update(pkg: Package, payload: UpdatePackagePayload) {
    pkg.merge(payload)
    await pkg.save()
    return pkg
  }

  async delete(pkg: Package) {
    await pkg.delete()
  }
}
