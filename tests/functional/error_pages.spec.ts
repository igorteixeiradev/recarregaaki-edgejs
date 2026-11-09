import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { createUser } from '#tests/helpers/factories'

/**
 * As páginas de erro usam o layout da aplicação, que depende de `auth` e das
 * mensagens flash. Num 404 os middlewares de sessão/auth não correm; antes,
 * isto transformava qualquer 404 em erro 500 em produção.
 */
test.group('Páginas de erro', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('um 404 de visitante mostra a página de erro (não dá 500)', async ({ client }) => {
    const response = await client.get('/nao-existe')

    response.assertStatus(404)
    response.assertTextIncludes('404')
  })

  test('um id inválido numa rota pública mostra a página 404', async ({ client }) => {
    const response = await client.get('/loja/abc')

    response.assertStatus(404)
    response.assertTextIncludes('404')
  })

  test('um 404 com sessão iniciada também funciona', async ({ client }) => {
    const user = await createUser()
    const response = await client.get('/nao-existe').loginAs(user)

    response.assertStatus(404)
  })

  test('um GET proibido mostra a página 403', async ({ client }) => {
    const user = await createUser()
    const response = await client.get('/dashboard').loginAs(user)

    response.assertStatus(403)
    response.assertTextIncludes('403')
  })
})
