import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import testUtils from '@adonisjs/core/services/test_utils'
import PaymentService from '#services/payment_service'
import RefillService from '#services/refill_service'
import ImageStorageService from '#services/image_storage_service'
import DashboardService from '#services/dashboard_service'
import { PaymentStatus } from '#enums/payment_status'
import { escapeLike } from '#utils/sql'
import { isUuid } from '#utils/uuid'
import { pageParams } from '#utils/pagination'
import {
  createAdmin,
  createCategory,
  createPackage,
  createPayment,
  createRefill,
} from '#tests/helpers/factories'

test.group('PaymentService', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('soma apenas pagamentos concluídos', async ({ assert }) => {
    await createPayment({ amount: 1000, status: PaymentStatus.Paid })
    await createPayment({ amount: 500, status: PaymentStatus.Paid })
    await createPayment({ amount: 9999, status: PaymentStatus.Pending })
    await createPayment({ amount: 9999, status: PaymentStatus.Failed })

    assert.equal(await new PaymentService().totalPaid(), 1500)
  })

  test('o total do mês ignora outros meses e pagamentos não concluídos', async ({ assert }) => {
    const reference = DateTime.fromISO('2026-05-15T12:00:00')

    await createPayment({ amount: 100, paidAt: DateTime.fromISO('2026-05-01T00:00:00') })
    await createPayment({ amount: 200, paidAt: DateTime.fromISO('2026-05-31T23:59:59') })
    await createPayment({ amount: 7000, paidAt: DateTime.fromISO('2026-04-30T23:59:59') })
    await createPayment({ amount: 7000, paidAt: DateTime.fromISO('2026-06-01T00:00:00') })
    await createPayment({
      amount: 7000,
      status: PaymentStatus.Pending,
      paidAt: DateTime.fromISO('2026-05-10T10:00:00'),
    })

    assert.equal(await new PaymentService().totalPaidInMonth(reference), 300)
  })

  test('devolve 0 quando não há pagamentos', async ({ assert }) => {
    const service = new PaymentService()
    assert.equal(await service.totalPaid(), 0)
    assert.equal(await service.totalPaidInMonth(), 0)
  })
})

test.group('RefillService', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  const service = () => new RefillService(new ImageStorageService())

  test('pesquisa na descrição e no nome', async ({ assert }) => {
    const byName = await createRefill({
      name: 'Steam Wallet',
      description: 'Cartão de presente digital',
    })
    const byDescription = await createRefill({
      name: 'Outro',
      description: 'Funciona na Steam em Angola',
    })
    const other = await createRefill({
      name: 'Netflix',
      description: 'Séries e filmes online sem limites',
    })
    for (const refill of [byName, byDescription, other])
      await createPackage({ refillId: refill.id })

    const result = await service().catalog({ page: 1, limit: 10, text: 'steam' })
    assert.sameMembers(
      result.all().map((r) => r.name),
      ['Steam Wallet', 'Outro']
    )
  })

  test('texto e categoria combinam com AND', async ({ assert }) => {
    const games = await createCategory({ name: 'Jogos' })
    const media = await createCategory({ name: 'Média' })
    const a = await createRefill({ name: 'Fifa Points', categoryId: games.id })
    const b = await createRefill({ name: 'Fifa Stream', categoryId: media.id })
    for (const refill of [a, b]) await createPackage({ refillId: refill.id })

    const result = await service().catalog({
      page: 1,
      limit: 10,
      text: 'fifa',
      categoryId: games.id,
    })
    assert.deepEqual(
      result.all().map((r) => r.name),
      ['Fifa Points']
    )
  })

  test('respeita a paginação', async ({ assert }) => {
    for (let i = 0; i < 5; i++) {
      const refill = await createRefill()
      await createPackage({ refillId: refill.id })
    }

    const page2 = await service().catalog({ page: 2, limit: 2 })
    assert.lengthOf(page2.all(), 2)
    assert.equal(page2.total, 5)
  })
})

test.group('DashboardService', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('conta registos e agrega pagamentos sem carregar tabelas inteiras', async ({ assert }) => {
    await createAdmin()
    await createPayment({ amount: 300 })
    await createPayment({ amount: 200 })

    const overview = await new DashboardService(new PaymentService()).overview({
      page: 1,
      limit: 10,
    })

    assert.equal(overview.totals.users, 3) // admin + 2 compradores
    assert.equal(overview.totals.packages, 2)
    assert.equal(overview.totals.refills, 2)
    assert.equal(overview.totalAmountPaid, 500)
    assert.lengthOf(overview.payments.all(), 2)
  })
})

test.group('Utilitários', () => {
  test('escapeLike protege %, _ e \\', ({ assert }) => {
    assert.equal(escapeLike('100%'), '100\\%')
    assert.equal(escapeLike('a_b'), 'a\\_b')
    assert.equal(escapeLike('a\\b'), 'a\\\\b')
    assert.equal(escapeLike('normal'), 'normal')
  })

  test('isUuid', ({ assert }) => {
    assert.isTrue(isUuid('11111111-1111-4111-8111-111111111111'))
    assert.isFalse(isUuid('abc'))
    assert.isFalse(isUuid(undefined))
    assert.isFalse(isUuid("1' OR '1'='1"))
  })

  test('pageParams limita e sanitiza page/limit', ({ assert }) => {
    const request = (query: Record<string, unknown>) =>
      ({ input: (key: string) => query[key] }) as any

    assert.deepEqual(pageParams(request({}), 20), { page: 1, limit: 20 })
    assert.deepEqual(pageParams(request({ page: '3', limit: '10' })), { page: 3, limit: 10 })
    assert.deepEqual(pageParams(request({ page: 'abc', limit: '-4' }), 15), { page: 1, limit: 15 })
    assert.deepEqual(pageParams(request({ page: '0', limit: '99999' })), { page: 1, limit: 100 })
  })
})
