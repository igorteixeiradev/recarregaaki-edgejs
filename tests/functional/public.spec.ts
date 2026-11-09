import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import limiter from '@adonisjs/limiter/services/main'
import Post from '#models/post'
import Refill from '#models/refill'
import {
  createAdmin,
  createCategory,
  createPackage,
  createPayment,
  createRefill,
  createUser,
} from '#tests/helpers/factories'
import { assertRedirect } from '#tests/helpers/http'

test.group('Site público | páginas', (group) => {
  group.each.setup(async () => {
    await limiter.clear()
    return testUtils.db().withGlobalTransaction()
  })

  const publicPages = [
    '/',
    '/sobre-nos',
    '/contactos',
    '/loja',
    '/blog',
    '/entrar',
    '/registar-se',
    '/esqueceu-palavra-passe',
    '/resetar-palavra-passe?token=abc',
  ]

  for (const page of publicPages) {
    test(`GET ${page} responde 200`, async ({ client }) => {
      const response = await client.get(page)
      response.assertStatus(200)
    })
  }

  test('o perfil mostra a página a quem está autenticado', async ({ client }) => {
    const user = await createUser()
    const response = await client.get('/perfil').loginAs(user)
    response.assertStatus(200)
  })

  test('utilizadores autenticados são enviados da página de login para o início', async ({
    client,
  }) => {
    const user = await createUser()
    const response = await client.get('/entrar').loginAs(user).redirects(0)
    assertRedirect(response, '/')
  })

  test('rotas inexistentes dão 404', async ({ client }) => {
    const response = await client.get('/nao-existe')
    response.assertStatus(404)
  })
})

test.group('Site público | loja', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('só mostra recargas ativas com pelo menos um pacote ativo', async ({ client, assert }) => {
    const visible = await createRefill({ name: 'RecargaVisivel' })
    await createPackage({ refillId: visible.id, isActive: true })

    const inactive = await createRefill({ name: 'RecargaInativa', isActive: false })
    await createPackage({ refillId: inactive.id, isActive: true })

    const noPackages = await createRefill({ name: 'RecargaSemPacotes' })
    void noPackages

    const onlyInactivePackages = await createRefill({ name: 'RecargaPacotesInativos' })
    await createPackage({ refillId: onlyInactivePackages.id, isActive: false })

    const text = (await client.get('/loja')).text()
    assert.include(text, 'RecargaVisivel')
    assert.notInclude(text, 'RecargaInativa')
    assert.notInclude(text, 'RecargaSemPacotes')
    assert.notInclude(text, 'RecargaPacotesInativos')
  })

  test('filtra por texto e por categoria em conjunto (o OR não vaza para a categoria)', async ({
    client,
    assert,
  }) => {
    const games = await createCategory({ name: 'Games' })
    const streaming = await createCategory({ name: 'Streaming' })

    const a = await createRefill({ name: 'Fortnite Vbucks', categoryId: games.id })
    const b = await createRefill({ name: 'Fortnite Streaming', categoryId: streaming.id })
    const c = await createRefill({ name: 'Netflix', categoryId: streaming.id })
    for (const refill of [a, b, c]) await createPackage({ refillId: refill.id })

    const text = (await client.get('/loja').qs({ q: 'fortnite', categoria: games.id })).text()

    assert.include(text, 'Fortnite Vbucks')
    // Antes, "texto OU descrição" ignorava a categoria e devolvia isto também
    assert.notInclude(text, 'Fortnite Streaming')
    assert.notInclude(text, 'Netflix')
  })

  test('um id de categoria inválido é ignorado em vez de dar erro 500', async ({ client }) => {
    const response = await client.get('/loja').qs({ categoria: 'abc' })
    response.assertStatus(200)
  })

  test('parâmetros de paginação inválidos não rebentam a página', async ({ client }) => {
    const response = await client.get('/loja').qs({ page: 'xyz', limit: '-5' })
    response.assertStatus(200)
  })

  test('o texto pesquisado é literal (100% não devolve tudo)', async ({ client, assert }) => {
    const refill = await createRefill({ name: 'Recarga Qualquer' })
    await createPackage({ refillId: refill.id })

    const text = (await client.get('/loja').qs({ q: '100%' })).text()
    assert.notInclude(text, 'Recarga Qualquer')
  })
})

test.group('Site público | detalhe da recarga', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('mostra apenas os pacotes ativos', async ({ client, assert }) => {
    const refill = await createRefill()
    await createPackage({ refillId: refill.id, name: 'PacoteAtivo', isActive: true })
    await createPackage({ refillId: refill.id, name: 'PacoteOculto', isActive: false })

    const text = (await client.get(`/loja/${refill.id}`)).text()
    assert.include(text, 'PacoteAtivo')
    assert.notInclude(text, 'PacoteOculto')
  })

  test('uma recarga inativa dá 404', async ({ client }) => {
    const refill = await createRefill({ isActive: false })
    const response = await client.get(`/loja/${refill.id}`)
    response.assertStatus(404)
  })

  test('um id que não é UUID dá 404', async ({ client }) => {
    const response = await client.get('/loja/abc')
    response.assertStatus(404)
  })

  test('o pacote escolhido vem da base de dados e não da query string', async ({
    client,
    assert,
  }) => {
    const refill = await createRefill()
    const pkg = await createPackage({ refillId: refill.id, name: 'PacoteReal', price: 1500 })

    const text = (
      await client
        .get(`/loja/${refill.id}`)
        .qs({ selectItem: pkg.id, name: 'NomeFalso', price: '1' })
    ).text()

    assert.include(text, 'PacoteReal')
    assert.notInclude(text, 'NomeFalso')
  })
})

test.group('Site público | blog', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('só mostra posts publicados', async ({ client, assert }) => {
    const admin = await createAdmin()
    await Post.create({
      userId: admin.id,
      title: 'PostPublicado',
      content: 'texto',
      isPublished: true,
    })
    await Post.create({
      userId: admin.id,
      title: 'PostRascunho',
      content: 'texto',
      isPublished: false,
    })

    const text = (await client.get('/blog')).text()
    assert.include(text, 'PostPublicado')
    assert.notInclude(text, 'PostRascunho')
  })

  test('um rascunho não é acessível pelo seu endereço', async ({ client }) => {
    const admin = await createAdmin()
    const draft = await Post.create({ userId: admin.id, title: 'Rascunho', content: 'texto' })
    const published = await Post.create({
      userId: admin.id,
      title: 'Publicado',
      content: 'texto',
      isPublished: true,
    })

    ;(await client.get(`/blog/${draft.id}`)).assertStatus(404)
    ;(await client.get(`/blog/${published.id}`)).assertStatus(200)
  })
})

test.group('Site público | perfil', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('mostra apenas os pagamentos do próprio utilizador', async ({ client, assert }) => {
    const me = await createUser()
    const other = await createUser()
    const mine = await createPayment({ userId: me.id })
    const theirs = await createPayment({ userId: other.id })

    const text = (await client.get('/perfil').loginAs(me)).text()
    assert.include(text, mine.id)
    assert.notInclude(text, theirs.id)
  })
})

test.group('Painel | dashboard', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('mostra os totais calculados na base de dados e o nome do consumidor', async ({
    client,
    assert,
  }) => {
    const admin = await createAdmin()
    const buyer = await createUser({ fullName: 'Compradora Teste' })
    const pkg = await createPackage()
    await createPayment({ userId: buyer.id, packageId: pkg.id, amount: 2500 })

    const text = (await client.get('/dashboard').loginAs(admin)).text()
    assert.include(text, 'Compradora Teste')
    assert.include(text, '2500')
    assert.equal(
      await Refill.query()
        .count('* as n')
        .first()
        .then((r) => Number(r!.$extras.n)),
      1
    )
  })
})
