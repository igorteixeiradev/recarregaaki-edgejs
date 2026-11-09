import { test } from '@japa/runner'
import drive from '@adonisjs/drive/services/main'
import limiter from '@adonisjs/limiter/services/main'
import testUtils from '@adonisjs/core/services/test_utils'
import Category from '#models/category'
import Package from '#models/package'
import Post from '#models/post'
import Refill from '#models/refill'
import User from '#models/user'
import {
  createAdmin,
  createCategory,
  createPackage,
  createPayment,
  createRefill,
  createUser,
} from '#tests/helpers/factories'
import { assertRedirect } from '#tests/helpers/http'

const DEFAULT_IMAGE = 'images/not-content-image.png'
const LONG_TEXT = 'Descrição com mais de vinte caracteres para passar na validação.'

// PNG 1x1 válido
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
)

const resetState = async () => {
  await limiter.clear()
  return testUtils.db().withGlobalTransaction()
}

test.group('Painel | categorias', (group) => {
  group.each.setup(resetState)

  test('cria, edita e apaga uma categoria', async ({ client, assert }) => {
    const admin = await createAdmin()

    const created = await client
      .post('/dashboard/categorias')
      .form({ name: 'Jogos', isActive: 'true' })
      .loginAs(admin)
      .withCsrfToken()
      .redirects(0)
    assertRedirect(created, '/dashboard/categorias')

    const category = await Category.findByOrFail('name', 'Jogos')
    assert.isTrue(category.isActive)

    // Desativar (o formulário envia "false" como texto)
    await client
      .put(`/dashboard/categorias/${category.id}`)
      .form({ name: 'Jogos', isActive: 'false' })
      .loginAs(admin)
      .withCsrfToken()
      .redirects(0)
    await category.refresh()
    assert.isFalse(category.isActive)

    await client
      .delete(`/dashboard/categorias/${category.id}`)
      .loginAs(admin)
      .withCsrfToken()
      .redirects(0)
    assert.isNull(await Category.find(category.id))
  })

  test('não permite nomes repetidos, mas deixa guardar o próprio nome', async ({
    client,
    assert,
  }) => {
    const admin = await createAdmin()
    const a = await createCategory({ name: 'Alpha' })
    const b = await createCategory({ name: 'Beta' })

    // Renomear B para o nome de A é recusado
    const clash = await client
      .put(`/dashboard/categorias/${b.id}`)
      .form({ name: 'Alpha' })
      .loginAs(admin)
      .withCsrfToken()
      .redirects(0)
    clash.assertStatus(302)
    await b.refresh()
    assert.equal(b.name, 'Beta')

    // Guardar A com o nome que já tem funciona (antes dava erro de unicidade)
    await client
      .put(`/dashboard/categorias/${a.id}`)
      .form({ name: 'Alpha', isActive: 'false' })
      .loginAs(admin)
      .withCsrfToken()
      .redirects(0)
    await a.refresh()
    assert.isFalse(a.isActive)
  })

  test('não apaga uma categoria que ainda tem recargas e avisa o utilizador', async ({
    client,
    assert,
  }) => {
    const admin = await createAdmin()
    const refill = await createRefill()

    const response = await client
      .delete(`/dashboard/categorias/${refill.categoryId}`)
      .loginAs(admin)
      .withCsrfToken()
      .redirects(0)

    response.assertStatus(302)
    response.assertFlashMessage('notification', {
      type: 'danger',
      message: 'Não é possível apagar: existem registos associados.',
    })
    assert.isNotNull(await Category.find(refill.categoryId))
    assert.isNotNull(await Refill.find(refill.id))
  })
})

test.group('Painel | recargas e imagens', (group) => {
  group.each.setup(resetState)
  group.each.setup(() => {
    drive.fake()
  })
  group.each.teardown(() => drive.restore())

  test('cria uma recarga sem imagem e usa a imagem por defeito', async ({ client, assert }) => {
    const admin = await createAdmin()
    const category = await createCategory()

    const response = await client
      .post('/dashboard/recargas')
      .form({ name: 'Netflix', description: LONG_TEXT, categoryId: category.id, isActive: 'true' })
      .loginAs(admin)
      .withCsrfToken()
      .redirects(0)
    assertRedirect(response, '/dashboard/recargas')

    const refill = await Refill.findByOrFail('name', 'Netflix')
    assert.equal(refill.image, DEFAULT_IMAGE)
  })

  test('cria uma recarga com imagem guardada no Drive', async ({ client, assert }) => {
    const disk = drive.fake()
    const admin = await createAdmin()
    const category = await createCategory()

    await client
      .post('/dashboard/recargas')
      .fields({ name: 'Spotify', description: LONG_TEXT, categoryId: category.id })
      .file('image', PNG, { filename: 'logo.png', contentType: 'image/png' })
      .loginAs(admin)
      .withCsrfToken()
      .redirects(0)

    const refill = await Refill.findByOrFail('name', 'Spotify')
    assert.match(refill.image, /^uploads\/[0-9a-f-]{36}\.png$/)
    await disk.assertExists(refill.image.replace('uploads/', ''))
  })

  test('rejeita ficheiros que não são imagens permitidas (inclui SVG)', async ({
    client,
    assert,
  }) => {
    const admin = await createAdmin()
    const category = await createCategory()

    await client
      .post('/dashboard/recargas')
      .fields({ name: 'Mau', description: LONG_TEXT, categoryId: category.id })
      .file('image', Buffer.from('<svg onload="alert(1)"></svg>'), { filename: 'x.svg' })
      .loginAs(admin)
      .withCsrfToken()
      .redirects(0)

    assert.isNull(await Refill.findBy('name', 'Mau'))
  })

  test('não cria recargas com categoria inexistente', async ({ client, assert }) => {
    const admin = await createAdmin()

    await client
      .post('/dashboard/recargas')
      .form({
        name: 'Sem categoria',
        description: LONG_TEXT,
        categoryId: '11111111-1111-4111-8111-111111111111',
      })
      .loginAs(admin)
      .withCsrfToken()
      .redirects(0)

    assert.isNull(await Refill.findBy('name', 'Sem categoria'))
  })

  test('trocar a imagem remove a anterior do Drive', async ({ client, assert }) => {
    const disk = drive.fake()
    const admin = await createAdmin()
    const category = await createCategory()

    await client
      .post('/dashboard/recargas')
      .fields({ name: 'Troca', description: LONG_TEXT, categoryId: category.id })
      .file('image', PNG, { filename: 'a.png' })
      .loginAs(admin)
      .withCsrfToken()
      .redirects(0)
    const refill = await Refill.findByOrFail('name', 'Troca')
    const oldKey = refill.image.replace('uploads/', '')

    await client
      .put(`/dashboard/recargas/${refill.id}`)
      .fields({ name: 'Troca' })
      .file('image', PNG, { filename: 'b.png' })
      .loginAs(admin)
      .withCsrfToken()
      .redirects(0)

    await refill.refresh()
    const newKey = refill.image.replace('uploads/', '')
    assert.notEqual(newKey, oldKey)
    await disk.assertExists(newKey)
    await disk.assertMissing(oldKey)
  })

  test('apagar a recarga apaga também a imagem', async ({ client, assert }) => {
    const disk = drive.fake()
    const admin = await createAdmin()
    const category = await createCategory()

    await client
      .post('/dashboard/recargas')
      .fields({ name: 'Apagar', description: LONG_TEXT, categoryId: category.id })
      .file('image', PNG, { filename: 'a.png' })
      .loginAs(admin)
      .withCsrfToken()
      .redirects(0)
    const refill = await Refill.findByOrFail('name', 'Apagar')
    const key = refill.image.replace('uploads/', '')

    await client
      .delete(`/dashboard/recargas/${refill.id}`)
      .loginAs(admin)
      .withCsrfToken()
      .redirects(0)

    assert.isNull(await Refill.find(refill.id))
    await disk.assertMissing(key)
  })

  test('mantém a imagem se a recarga não puder ser apagada (tem pagamentos)', async ({
    client,
    assert,
  }) => {
    const disk = drive.fake()
    const admin = await createAdmin()
    const pkg = await createPackage()
    const refill = await Refill.findOrFail(pkg.refillId)
    await disk.put('keep.png', PNG)
    refill.image = 'uploads/keep.png'
    await refill.save()
    await createPayment({ packageId: pkg.id })

    const response = await client
      .delete(`/dashboard/recargas/${refill.id}`)
      .loginAs(admin)
      .withCsrfToken()
      .redirects(0)

    response.assertFlashMessage('notification', {
      type: 'danger',
      message: 'Não é possível apagar: existem registos associados.',
    })
    assert.isNotNull(await Refill.find(refill.id))
    await disk.assertExists('keep.png')
  })
})

test.group('Painel | pacotes', (group) => {
  group.each.setup(resetState)

  test('o pacote pertence sempre à recarga da rota, nunca à do corpo do pedido', async ({
    client,
    assert,
  }) => {
    const admin = await createAdmin()
    const refill = await createRefill()
    const another = await createRefill()

    const response = await client
      .post(`/dashboard/${refill.id}/pacotes`)
      .form({ name: 'Pacote 500', price: '500', refillId: another.id, isActive: 'true' })
      .loginAs(admin)
      .withCsrfToken()
      .redirects(0)

    assertRedirect(response, `/dashboard/${refill.id}/pacotes`)
    const pkg = await Package.findByOrFail('name', 'Pacote 500')
    assert.equal(pkg.refillId, refill.id)
    assert.strictEqual(pkg.price, 500)
  })

  test('atualizar sem enviar o refillId volta à listagem certa (antes ia para /undefined)', async ({
    client,
    assert,
  }) => {
    const admin = await createAdmin()
    const pkg = await createPackage({ price: 100 })

    const response = await client
      .put(`/dashboard/${pkg.refillId}/pacotes/${pkg.id}`)
      .form({ price: '250.5', isActive: 'false' })
      .loginAs(admin)
      .withCsrfToken()
      .redirects(0)

    assertRedirect(response, `/dashboard/${pkg.refillId}/pacotes`)
    await pkg.refresh()
    assert.strictEqual(pkg.price, 250.5)
    assert.isFalse(pkg.isActive)
  })

  test('não permite editar nem apagar um pacote através de outra recarga', async ({
    client,
    assert,
  }) => {
    const admin = await createAdmin()
    const pkg = await createPackage()
    const otherRefill = await createRefill()

    const edit = await client
      .get(`/dashboard/${otherRefill.id}/pacotes/${pkg.id}/edit`)
      .loginAs(admin)
      .redirects(0)
    edit.assertStatus(404)

    const update = await client
      .put(`/dashboard/${otherRefill.id}/pacotes/${pkg.id}`)
      .form({ name: 'Hack' })
      .loginAs(admin)
      .withCsrfToken()
      .redirects(0)
    update.assertStatus(404)

    const remove = await client
      .delete(`/dashboard/${otherRefill.id}/pacotes/${pkg.id}`)
      .loginAs(admin)
      .withCsrfToken()
      .redirects(0)
    remove.assertStatus(404)

    await pkg.refresh()
    assert.notEqual(pkg.name, 'Hack')
  })

  test('um pacote com pagamentos não pode ser apagado (histórico protegido)', async ({
    client,
    assert,
  }) => {
    const admin = await createAdmin()
    const pkg = await createPackage()
    await createPayment({ packageId: pkg.id })

    const response = await client
      .delete(`/dashboard/${pkg.refillId}/pacotes/${pkg.id}`)
      .loginAs(admin)
      .withCsrfToken()
      .redirects(0)

    response.assertFlashMessage('notification', {
      type: 'danger',
      message: 'Não é possível apagar: existem registos associados.',
    })
    assert.isNotNull(await Package.find(pkg.id))
  })
})

test.group('Painel | blog', (group) => {
  group.each.setup(resetState)
  group.each.setup(() => {
    drive.fake()
  })
  group.each.teardown(() => drive.restore())

  test('cria um post sem imagem (antes dava erro 500) com o admin como autor', async ({
    client,
    assert,
  }) => {
    const admin = await createAdmin()

    const response = await client
      .post('/dashboard/blog')
      .form({ title: 'Novidades', content: 'Conteúdo do artigo', isPublished: 'true' })
      .loginAs(admin)
      .withCsrfToken()
      .redirects(0)
    assertRedirect(response, '/dashboard/blog')

    const post = await Post.findByOrFail('title', 'Novidades')
    assert.equal(post.userId, admin.id)
    assert.equal(post.image, DEFAULT_IMAGE)
    assert.isTrue(post.isPublished)
  })

  test('edita e apaga um post', async ({ client, assert }) => {
    const admin = await createAdmin()
    const post = await Post.create({ userId: admin.id, title: 'Antigo', content: 'Texto antigo' })

    await client
      .put(`/dashboard/blog/${post.id}`)
      .form({ title: 'Novo título', isPublished: 'true' })
      .loginAs(admin)
      .withCsrfToken()
      .redirects(0)
    await post.refresh()
    assert.equal(post.title, 'Novo título')
    assert.isTrue(post.isPublished)

    await client.delete(`/dashboard/blog/${post.id}`).loginAs(admin).withCsrfToken().redirects(0)
    assert.isNull(await Post.find(post.id))
  })
})

test.group('Painel | consumidores', (group) => {
  group.each.setup(resetState)

  test('o admin cria um utilizador que consegue entrar', async ({ client, assert }) => {
    const admin = await createAdmin()

    await client
      .post('/dashboard/consumidores')
      .form({
        fullName: 'Novo Consumidor',
        email: 'novo@example.com',
        password: 'password123',
        passwordConfirmation: 'password123',
      })
      .loginAs(admin)
      .withCsrfToken()
      .redirects(0)

    const user = await User.findByOrFail('email', 'novo@example.com')
    assert.isFalse(user.isAdmin)
    assert.match(user.avatarUrl ?? '', /^data:image\/svg\+xml;base64,/)
    await assert.doesNotReject(() => User.verifyCredentials('novo@example.com', 'password123'))
  })

  test('atualiza sem exigir palavra-passe e sem a alterar (antes era obrigatória)', async ({
    client,
    assert,
  }) => {
    const admin = await createAdmin()
    const user = await createUser({ email: 'u@example.com', password: 'password123' })

    await client
      .put(`/dashboard/consumidores/${user.id}`)
      .form({ fullName: 'Nome Atualizado', phoneCode: '+244', phoneNumber: '923000111' })
      .loginAs(admin)
      .withCsrfToken()
      .redirects(0)

    await user.refresh()
    assert.equal(user.fullName, 'Nome Atualizado')
    assert.equal(user.phoneNumber, '923000111')
    await assert.doesNotReject(() => User.verifyCredentials('u@example.com', 'password123'))
  })

  test('permite mudar o email para um valor novo, mas não para um já usado', async ({
    client,
    assert,
  }) => {
    const admin = await createAdmin()
    const user = await createUser({ email: 'antes@example.com' })
    await createUser({ email: 'ocupado@example.com' })

    await client
      .put(`/dashboard/consumidores/${user.id}`)
      .form({ email: 'ocupado@example.com' })
      .loginAs(admin)
      .withCsrfToken()
      .redirects(0)
    await user.refresh()
    assert.equal(user.email, 'antes@example.com')

    await client
      .put(`/dashboard/consumidores/${user.id}`)
      .form({ email: 'depois@example.com' })
      .loginAs(admin)
      .withCsrfToken()
      .redirects(0)
    await user.refresh()
    assert.equal(user.email, 'depois@example.com')
  })

  test('bloquear e desbloquear através do campo isBlocked do formulário', async ({
    client,
    assert,
  }) => {
    const admin = await createAdmin()
    const user = await createUser()

    await client
      .put(`/dashboard/consumidores/${user.id}`)
      .form({ isBlocked: 'true' })
      .loginAs(admin)
      .withCsrfToken()
      .redirects(0)
    await user.refresh()
    assert.isTrue(user.isBlocked)

    await client
      .put(`/dashboard/consumidores/${user.id}`)
      .form({ isBlocked: 'false' })
      .loginAs(admin)
      .withCsrfToken()
      .redirects(0)
    await user.refresh()
    assert.isFalse(user.isBlocked)
  })

  test('não apaga um consumidor com pagamentos (histórico protegido)', async ({
    client,
    assert,
  }) => {
    const admin = await createAdmin()
    const payment = await createPayment()

    const response = await client
      .delete(`/dashboard/consumidores/${payment.userId}`)
      .loginAs(admin)
      .withCsrfToken()
      .redirects(0)

    response.assertFlashMessage('notification', {
      type: 'danger',
      message: 'Não é possível apagar: existem registos associados.',
    })
    assert.isNotNull(await User.find(payment.userId))
  })
})
