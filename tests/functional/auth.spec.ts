import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import mail from '@adonisjs/mail/services/main'
import limiter from '@adonisjs/limiter/services/main'
import testUtils from '@adonisjs/core/services/test_utils'
import app from '@adonisjs/core/services/app'
import User from '#models/user'
import VerificationToken from '#models/verification_token'
import VerificationTokenService from '#services/verification_token_service'
import VerifyEmailNotification from '#mails/verify_email_notification'
import ResetPasswordNotification from '#mails/reset_password_notification'
import { VerificationTokenType } from '#enums/verification_token_type'
import { createUser } from '#tests/helpers/factories'
import { assertRedirect } from '#tests/helpers/http'
import { toDbDate } from '#utils/dates'

test.group('Auth | registo', (group) => {
  group.each.setup(async () => {
    await limiter.clear()
    return testUtils.db().withGlobalTransaction()
  })
  group.each.teardown(() => mail.restore())

  test('regista um utilizador comum e envia o email de verificação', async ({ client, assert }) => {
    const { mails } = mail.fake()

    const response = await client
      .post('/registar-se')
      .form({
        fullName: 'Maria Silva',
        email: 'Maria@Example.com',
        password: 'password123',
        passwordConfirmation: 'password123',
      })
      .withCsrfToken()
      .redirects(0)

    assertRedirect(response, '/entrar')

    const user = await User.findByOrFail('email', 'maria@example.com')
    assert.isFalse(user.isAdmin)
    assert.isFalse(user.isEmailVerified)
    assert.isFalse(user.isBlocked)
    assert.match(user.avatarUrl ?? '', /^data:image\/svg\+xml;base64,/)

    mails.assertSent(VerifyEmailNotification, ({ message }) => message.hasTo('maria@example.com'))
  })

  test('ignora campos privilegiados enviados no registo (mass assignment)', async ({
    client,
    assert,
  }) => {
    mail.fake()

    await client
      .post('/registar-se')
      .form({
        fullName: 'Intruso Teste',
        email: 'intruso@example.com',
        password: 'password123',
        passwordConfirmation: 'password123',
        isAdmin: true,
        isEmailVerified: true,
        isBlocked: false,
        phoneNumber: '999',
      })
      .withCsrfToken()
      .redirects(0)

    const user = await User.findByOrFail('email', 'intruso@example.com')
    assert.isFalse(user.isAdmin)
    assert.isFalse(user.isEmailVerified)
    assert.isNull(user.phoneNumber)
  })

  test('rejeita email repetido sem criar outro utilizador', async ({ client, assert }) => {
    mail.fake()
    await createUser({ email: 'repetido@example.com' })

    await client
      .post('/registar-se')
      .form({
        fullName: 'Outro Nome',
        email: 'repetido@example.com',
        password: 'password123',
        passwordConfirmation: 'password123',
      })
      .withCsrfToken()
      .redirects(0)

    assert.equal(
      await User.query()
        .where('email', 'repetido@example.com')
        .count('* as n')
        .first()
        .then((r) => Number(r!.$extras.n)),
      1
    )
  })

  test('rejeita palavra-passe de confirmação diferente', async ({ client, assert }) => {
    mail.fake()

    await client
      .post('/registar-se')
      .form({
        fullName: 'Sem Confirmação',
        email: 'semconf@example.com',
        password: 'password123',
        passwordConfirmation: 'outra-coisa-123',
      })
      .withCsrfToken()
      .redirects(0)

    assert.isNull(await User.findBy('email', 'semconf@example.com'))
  })
})

test.group('Auth | login e logout', (group) => {
  group.each.setup(async () => {
    await limiter.clear()
    return testUtils.db().withGlobalTransaction()
  })

  test('entra com credenciais corretas', async ({ client }) => {
    const user = await createUser({ email: 'login@example.com', password: 'password123' })

    const response = await client
      .post('/entrar')
      .form({ email: 'login@example.com', password: 'password123' })
      .withCsrfToken()
      .redirects(0)

    assertRedirect(response, '/')
    response.assertSession('auth_web', user.id)
  })

  test('não entra com palavra-passe errada', async ({ client }) => {
    await createUser({ email: 'errada@example.com', password: 'password123' })

    const response = await client
      .post('/entrar')
      .form({ email: 'errada@example.com', password: 'palavra-errada' })
      .withCsrfToken()
      .redirects(0)

    response.assertStatus(302)
    response.assertSessionMissing('auth_web')
    response.assertFlashMessage('notification', {
      type: 'danger',
      message: 'Credenciais inválidas',
    })
  })

  test('não entra se a conta estiver bloqueada', async ({ client }) => {
    await createUser({ email: 'bloq@example.com', password: 'password123', isBlocked: true })

    const response = await client
      .post('/entrar')
      .form({ email: 'bloq@example.com', password: 'password123' })
      .withCsrfToken()
      .redirects(0)

    response.assertStatus(302)
    response.assertSessionMissing('auth_web')
  })

  test('um utilizador bloqueado perde a sessão que já tinha', async ({ client }) => {
    const user = await createUser({ isBlocked: true })

    const response = await client.get('/perfil').loginAs(user).redirects(0)
    assertRedirect(response, '/entrar')
  })

  test('limita as tentativas de login (força bruta)', async ({ client }) => {
    const statuses: number[] = []

    for (let i = 0; i < 7; i++) {
      const response = await client
        .post('/entrar')
        .form({ email: 'brute@example.com', password: 'tentativa-errada' })
        .withCsrfToken()
        .redirects(0)
      statuses.push(response.status())
    }

    // As primeiras 5 são tratadas normalmente; a partir daí há bloqueio (429)
    assertStatuses(statuses.slice(0, 5), 302)
    assertStatuses(statuses.slice(5), 429)
  })

  test('termina a sessão', async ({ client }) => {
    const user = await createUser()

    const response = await client.get('/logout').loginAs(user).redirects(0)
    assertRedirect(response, '/')
  })

  test('visitantes não acedem ao perfil', async ({ client }) => {
    const response = await client.get('/perfil').redirects(0)
    assertRedirect(response, '/entrar')
  })
})

test.group('Auth | verificação de email', (group) => {
  group.each.setup(async () => {
    await limiter.clear()
    return testUtils.db().withGlobalTransaction()
  })
  group.each.teardown(() => mail.restore())

  test('confirma o email com um token válido (uso único)', async ({ client, assert }) => {
    const user = await createUser({ isEmailVerified: false })
    const token = await new VerificationTokenService().issue(
      user.email,
      VerificationTokenType.EmailVerification
    )

    const response = await client.get('/verificar-email').qs({ token }).redirects(0)
    assertRedirect(response, '/entrar')

    await user.refresh()
    assert.isTrue(user.isEmailVerified)

    // O segundo uso do mesmo link já não funciona
    const second = await createUser({ email: 'outro@example.com', isEmailVerified: false })
    const reused = await client.get('/verificar-email').qs({ token }).redirects(0)
    assertRedirect(reused, '/entrar')
    await second.refresh()
    assert.isFalse(second.isEmailVerified)
  })

  test('um token de redefinição de palavra-passe não verifica o email', async ({
    client,
    assert,
  }) => {
    const user = await createUser({ isEmailVerified: false })
    const token = await new VerificationTokenService().issue(
      user.email,
      VerificationTokenType.PasswordReset
    )

    await client.get('/verificar-email').qs({ token }).redirects(0)

    await user.refresh()
    assert.isFalse(user.isEmailVerified)
  })

  test('rejeita tokens inválidos e expirados', async ({ client, assert }) => {
    const user = await createUser({ isEmailVerified: false })
    const token = await new VerificationTokenService().issue(
      user.email,
      VerificationTokenType.EmailVerification
    )
    await VerificationToken.query().update({
      expiresAt: toDbDate(DateTime.now().minus({ minutes: 1 })) as any,
    })

    await client.get('/verificar-email').qs({ token }).redirects(0)
    await client.get('/verificar-email').qs({ token: 'nao-existe' }).redirects(0)
    await client.get('/verificar-email').redirects(0)

    await user.refresh()
    assert.isFalse(user.isEmailVerified)
  })

  test('o token não é guardado em texto simples', async ({ assert }) => {
    const user = await createUser()
    const token = await new VerificationTokenService().issue(
      user.email,
      VerificationTokenType.EmailVerification
    )

    const stored = await VerificationToken.firstOrFail()
    assert.notEqual(stored.token, token)
    assert.lengthOf(stored.token, 64)
  })

  test('reenvia o email de verificação apenas a quem ainda não confirmou', async ({ client }) => {
    const { mails } = mail.fake()
    const unverified = await createUser({ isEmailVerified: false })
    const verified = await createUser({ isEmailVerified: true })

    await client.get('/reenviar-email-verificacao').loginAs(unverified).redirects(0)
    mails.assertSentCount(VerifyEmailNotification, 1)

    await client.get('/reenviar-email-verificacao').loginAs(verified).redirects(0)
    mails.assertSentCount(VerifyEmailNotification, 1)
  })
})

test.group('Auth | recuperação de palavra-passe', (group) => {
  group.each.setup(async () => {
    await limiter.clear()
    return testUtils.db().withGlobalTransaction()
  })
  group.each.teardown(() => mail.restore())

  test('envia o email e responde igual para contas inexistentes', async ({ client }) => {
    const { mails } = mail.fake()
    await createUser({ email: 'existe@example.com' })

    const known = await client
      .post('/esqueceu-palavra-passe')
      .form({ email: 'existe@example.com' })
      .withCsrfToken()
      .redirects(0)
    const unknown = await client
      .post('/esqueceu-palavra-passe')
      .form({ email: 'naoexiste@example.com' })
      .withCsrfToken()
      .redirects(0)

    // Mesma resposta: não revela que emails estão registados
    assertRedirect(known, '/')
    assertRedirect(unknown, '/')

    mails.assertSentCount(ResetPasswordNotification, 1)
    mails.assertSent(ResetPasswordNotification, ({ message }) =>
      message.hasTo('existe@example.com')
    )
  })

  test('o link do email aponta para APP_URL com o token', async ({ client, assert }) => {
    const { mails } = mail.fake()
    await createUser({ email: 'link@example.com' })

    await client
      .post('/esqueceu-palavra-passe')
      .form({ email: 'link@example.com' })
      .withCsrfToken()
      .redirects(0)

    const [sent] = mails.sent((mailInstance) => mailInstance instanceof ResetPasswordNotification)
    const html = String(sent.message.toJSON().message.html)
    assert.match(html, /http:\/\/localhost:3334\/resetar-palavra-passe\?token=[0-9a-f]{64}/)
  })

  test('redefine a palavra-passe com um token válido e só uma vez', async ({ client, assert }) => {
    const user = await createUser({ email: 'reset@example.com', password: 'antiga-12345' })
    const token = await new VerificationTokenService().issue(
      user.email,
      VerificationTokenType.PasswordReset
    )

    const first = await client
      .post('/resetar-palavra-passe')
      .form({ token, password: 'nova-12345', passwordConfirmation: 'nova-12345' })
      .withCsrfToken()
      .redirects(0)
    assertRedirect(first, '/entrar')

    await assert.doesNotReject(() => User.verifyCredentials('reset@example.com', 'nova-12345'))
    await assert.rejects(() => User.verifyCredentials('reset@example.com', 'antiga-12345'))

    const second = await client
      .post('/resetar-palavra-passe')
      .form({ token, password: 'outra-12345', passwordConfirmation: 'outra-12345' })
      .withCsrfToken()
      .redirects(0)
    assertRedirect(second, '/esqueceu-palavra-passe')
    await assert.rejects(() => User.verifyCredentials('reset@example.com', 'outra-12345'))
  })

  test('um token de verificação de email NÃO redefine a palavra-passe', async ({
    client,
    assert,
  }) => {
    const user = await createUser({ email: 'cross@example.com', password: 'antiga-12345' })
    const token = await new VerificationTokenService().issue(
      user.email,
      VerificationTokenType.EmailVerification
    )

    const response = await client
      .post('/resetar-palavra-passe')
      .form({ token, password: 'invasor-123', passwordConfirmation: 'invasor-123' })
      .withCsrfToken()
      .redirects(0)

    assertRedirect(response, '/esqueceu-palavra-passe')
    await assert.doesNotReject(() => User.verifyCredentials('cross@example.com', 'antiga-12345'))
  })

  test('pedir nova redefinição invalida o token anterior', async ({ assert }) => {
    const user = await createUser()
    const tokens = new VerificationTokenService()

    const first = await tokens.issue(user.email, VerificationTokenType.PasswordReset)
    const second = await tokens.issue(user.email, VerificationTokenType.PasswordReset)

    assert.isNull(await tokens.consume(first, VerificationTokenType.PasswordReset))
    assert.equal(await tokens.consume(second, VerificationTokenType.PasswordReset), user.email)
  })
})

function assertStatuses(statuses: number[], expected: number) {
  for (const status of statuses) {
    if (status !== expected) {
      throw new Error(`Esperava ${expected} mas recebeu ${statuses.join(', ')}`)
    }
  }
}

// Evita aviso de importação não usada quando os testes são filtrados
void app
