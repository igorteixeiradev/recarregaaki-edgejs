import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import {
  createCategory,
  createPackage,
  createPayment,
  createRefill,
  createUser,
} from '#tests/helpers/factories'
import Category from '#models/category'
import Post from '#models/post'
import Refill from '#models/refill'

test.group('Models', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('gera um UUID ao criar o registo', async ({ assert }) => {
    const category = await createCategory()
    assert.match(category.id, /^[0-9a-f-]{36}$/)
    assert.isNotNull(await Category.find(category.id))
  })

  test('a imagem de uma recarga usa o valor por defeito da BD', async ({ assert }) => {
    const refill = await createRefill()
    await refill.refresh()
    assert.equal(refill.image, 'images/not-content-image.png')
  })

  test('o post sem imagem usa a imagem por defeito', async ({ assert }) => {
    const author = await createUser()
    const post = await Post.create({ userId: author.id, title: 'Olá', content: 'Conteúdo' })
    await post.refresh()
    assert.equal(post.image, 'images/not-content-image.png')
    assert.isFalse(post.isPublished)
  })

  test('o preço devolve-se como número', async ({ assert }) => {
    const pkg = await createPackage({ price: 1500.5 })
    await pkg.refresh()
    assert.strictEqual(pkg.price, 1500.5)
  })

  test('a palavra-passe é guardada com hash e não é serializada', async ({ assert }) => {
    const user = await createUser({ password: 'segredo-123' })
    assert.notEqual(user.password, 'segredo-123')
    assert.notProperty(user.serialize(), 'password')
  })

  test('não deixa apagar um pacote com pagamentos (histórico protegido)', async ({ assert }) => {
    const payment = await createPayment()
    const pkg = await payment.related('package').query().firstOrFail()
    await assert.rejects(() => pkg.delete(), /FOREIGN KEY/i)
  })

  test('não deixa apagar uma categoria que ainda tem recargas', async ({ assert }) => {
    const refill = await createRefill()
    const category = await Category.findOrFail(refill.categoryId)
    await assert.rejects(() => category.delete(), /FOREIGN KEY/i)
    assert.isNotNull(await Refill.find(refill.id))
  })
})
