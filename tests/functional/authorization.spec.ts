import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import testUtils from '@adonisjs/core/services/test_utils'
import limiter from '@adonisjs/limiter/services/main'
import ExchangeRateService from '#services/exchange_rate_service'
import Category from '#models/category'
import type Package from '#models/package'
import type Post from '#models/post'
import type User from '#models/user'
import Post_ from '#models/post'
import { createAdmin, createCategory, createPackage, createUser } from '#tests/helpers/factories'
import { assertAllowed, assertDenied, assertRedirect } from '#tests/helpers/http'

type Fixtures = { category: Category; pkg: Package; post: Post; other: User }
type Method = 'get' | 'post' | 'put' | 'delete'

/**
 * Todas as rotas do painel. Cada uma tem de recusar visitantes (login),
 * recusar utilizadores comuns (403) e só deixar passar administradores.
 * Os marcadores (:category, :refill, :pkg, :post, :user) são trocados pelos ids reais.
 */
const adminRoutes = [
  'GET /dashboard',
  'GET /dashboard/kwanza-hoje',

  'GET /dashboard/categorias',
  'GET /dashboard/categorias/create',
  'POST /dashboard/categorias',
  'GET /dashboard/categorias/:category/edit',
  'PUT /dashboard/categorias/:category',
  'DELETE /dashboard/categorias/:category',

  'GET /dashboard/recargas',
  'GET /dashboard/recargas/create',
  'POST /dashboard/recargas',
  'GET /dashboard/recargas/:refill/edit',
  'PUT /dashboard/recargas/:refill',
  'DELETE /dashboard/recargas/:refill',

  'GET /dashboard/:refill/pacotes',
  'GET /dashboard/:refill/pacotes/create',
  'POST /dashboard/:refill/pacotes',
  'GET /dashboard/:refill/pacotes/:pkg/edit',
  'PUT /dashboard/:refill/pacotes/:pkg',
  'DELETE /dashboard/:refill/pacotes/:pkg',

  'GET /dashboard/consumidores',
  'GET /dashboard/consumidores/create',
  'POST /dashboard/consumidores',
  'GET /dashboard/consumidores/:user/edit',
  'PUT /dashboard/consumidores/:user',
  'DELETE /dashboard/consumidores/:user',

  'GET /dashboard/pagamentos',

  'GET /dashboard/blog',
  'GET /dashboard/blog/create',
  'POST /dashboard/blog',
  'GET /dashboard/blog/:post/edit',
  'PUT /dashboard/blog/:post',
  'DELETE /dashboard/blog/:post',
]

function resolve(route: string, f: Fixtures): { method: Method; url: string } {
  const [verb, template] = route.split(' ')
  const url = template
    .replace(':category', f.category.id)
    .replace(/:refill/g, f.pkg.refillId)
    .replace(':pkg', f.pkg.id)
    .replace(':post', f.post.id)
    .replace(':user', f.other.id)
  return { method: verb.toLowerCase() as Method, url }
}

test.group('Autorização | rotas do painel', (group) => {
  let fixtures: Fixtures
  let admin: User
  let regularUser: User

  group.each.setup(async () => {
    await limiter.clear()
    const rollback = await testUtils.db().withGlobalTransaction()

    admin = await createAdmin()
    regularUser = await createUser()
    fixtures = {
      category: await createCategory(),
      pkg: await createPackage(),
      post: await Post_.create({ userId: admin.id, title: 'Post', content: 'Conteúdo do post' }),
      other: await createUser(),
    }

    // As cotações vêm de um serviço externo: nos testes usamos um falso
    app.container.swap(ExchangeRateService, () => ({ today: async () => [] }) as any)

    return async () => {
      app.container.restore(ExchangeRateService)
      await rollback()
    }
  })

  for (const route of adminRoutes) {
    test(`visitante é enviado para o login | ${route}`, async ({ client }) => {
      const { method, url } = resolve(route, fixtures)
      const response = await client[method](url).withCsrfToken().redirects(0)
      assertRedirect(response, '/entrar')
    })

    test(`utilizador comum é recusado | ${route}`, async ({ client }) => {
      const { method, url } = resolve(route, fixtures)
      const response = await client[method](url).loginAs(regularUser).withCsrfToken().redirects(0)
      assertDenied(response, method)
    })

    test(`administrador tem acesso | ${route}`, async ({ client }) => {
      const { method, url } = resolve(route, fixtures)
      const response = await client[method](url).loginAs(admin).withCsrfToken().redirects(0)

      // GET devolve a página; escritas sem dados válidos voltam ao formulário (302)
      assertAllowed(response, method)
    })
  }
})

test.group('Autorização | regras com alvo', (group) => {
  group.each.setup(async () => {
    await limiter.clear()
    return testUtils.db().withGlobalTransaction()
  })

  test('um administrador não pode apagar a própria conta', async ({ client, assert }) => {
    const admin = await createAdmin()

    const response = await client
      .delete(`/dashboard/consumidores/${admin.id}`)
      .loginAs(admin)
      .withCsrfToken()
      .redirects(0)

    assertDenied(response, 'delete')
    await admin.refresh()
    assert.isTrue(admin.isAdmin)
  })

  test('um administrador não pode retirar a si próprio o papel de admin nem bloquear-se', async ({
    client,
    assert,
  }) => {
    const admin = await createAdmin()

    await client
      .put(`/dashboard/consumidores/${admin.id}`)
      .form({ fullName: 'Admin Renomeado', isAdmin: false, isBlocked: true })
      .loginAs(admin)
      .withCsrfToken()
      .redirects(0)

    await admin.refresh()
    assert.equal(admin.fullName, 'Admin Renomeado')
    assert.isTrue(admin.isAdmin)
    assert.isFalse(admin.isBlocked)
  })

  test('um administrador pode apagar outro utilizador', async ({ client, assert }) => {
    const admin = await createAdmin()
    const other = await createUser()

    const response = await client
      .delete(`/dashboard/consumidores/${other.id}`)
      .loginAs(admin)
      .withCsrfToken()
      .redirects(0)

    assertRedirect(response, '/dashboard/consumidores')
    const { default: User } = await import('#models/user')
    assert.isNull(await User.find(other.id))
  })

  test('o formulário real (POST + ?_method=DELETE) também é protegido', async ({
    client,
    assert,
  }) => {
    const user = await createUser()
    const category = await createCategory()

    const response = await client
      .post(`/dashboard/categorias/${category.id}?_method=DELETE`)
      .loginAs(user)
      .withCsrfToken()
      .redirects(0)

    assertDenied(response, 'post')
    assert.isNotNull(await Category.find(category.id))
  })

  test('pedidos sem token CSRF são recusados', async ({ client, assert }) => {
    const admin = await createAdmin()
    const category = await createCategory()

    const response = await client
      .delete(`/dashboard/categorias/${category.id}`)
      .loginAs(admin)
      .redirects(0)

    response.assertStatus(302)
    response.assertFlashMessage('errorsBag', { E_BAD_CSRF_TOKEN: 'Invalid or expired CSRF token' })
    assert.isNotNull(await Category.find(category.id))
  })

  test('um id que não é UUID dá 404 em vez de erro 500', async ({ client }) => {
    const admin = await createAdmin()

    const response = await client.get('/dashboard/categorias/abc/edit').loginAs(admin).redirects(0)
    response.assertStatus(404)
  })
})
