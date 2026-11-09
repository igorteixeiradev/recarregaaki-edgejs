/*
|--------------------------------------------------------------------------
| Rotas da aplicação
|--------------------------------------------------------------------------
*/

import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'
import { loginThrottle, throttle } from '#start/limiter'

// Os ids das rotas são sempre UUIDs; qualquer outro valor é um 404 (e não um erro 500)
router.where('id', router.matchers.uuid())
router.where('refillId', router.matchers.uuid())

/*
|--------------------------------------------------------------------------
| Páginas estáticas
|--------------------------------------------------------------------------
*/
router.get('/', [controllers.Public, 'home']).as('web.home')
router.on('/sobre-nos').render('pages/public/about').as('web.about')
router.on('/contactos').render('pages/public/contact').as('web.contact')
router.get('/loja', [controllers.Public, 'shop']).as('web.shop')
router.get('/loja/:id', [controllers.Public, 'show']).as('web.show')
router.get('/blog', [controllers.Public, 'blog']).as('web.blog')
router.get('/blog/:id', [controllers.Public, 'showBlogPost']).as('web.showBlogPost')
router.get('/perfil', [controllers.Public, 'profile']).as('web.profile').use(middleware.auth())

/*
|--------------------------------------------------------------------------
| Autenticação
|--------------------------------------------------------------------------
*/
router
  .group(() => {
    router.on('/entrar').render('pages/public/auth/login').as('auth.login.view')
    router.on('/registar-se').render('pages/public/auth/register').as('auth.register.view')
    router
      .on('/esqueceu-palavra-passe')
      .render('pages/public/auth/forgot-password')
      .as('auth.forgot-password.view')
    router
      .get('/resetar-palavra-passe', [controllers.Auth, 'showResetPassword'])
      .as('auth.reset-password.view')

    router.post('/entrar', [controllers.Auth, 'login']).as('auth.login').use(loginThrottle)
    router.post('/registar-se', [controllers.Auth, 'register']).as('auth.store').use(throttle)
    router
      .post('/esqueceu-palavra-passe', [controllers.Auth, 'forgotPassword'])
      .as('auth.forgot-password')
      .use(throttle)
    router
      .post('/resetar-palavra-passe', [controllers.Auth, 'resetPassword'])
      .as('auth.reset-password')
      .use(throttle)
  })
  .use(middleware.guest())

router.get('/logout', [controllers.Auth, 'logout']).as('auth.logout').use(middleware.auth())
router
  .get('/verificar-email', [controllers.Auth, 'verifyEmail'])
  .as('auth.verifyEmail')
  .use(throttle)
router
  .get('/reenviar-email-verificacao', [controllers.Auth, 'resendVerificationEmail'])
  .as('auth.resendVerificationEmail')
  .use([middleware.auth(), throttle])

/*
|--------------------------------------------------------------------------
| Painel de administração
|--------------------------------------------------------------------------
|
| O middleware "auth" só garante que existe sessão; quem pode fazer o quê é
| decidido pelas policies do Bouncer dentro de cada controller.
|
*/
router
  .group(() => {
    router.get('/', [controllers.Dashboard, 'index']).as('dashboard.index')
    router.get('/kwanza-hoje', [controllers.Dashboard, 'exchangeRate']).as('dashboard.kz')

    router.resource('categorias', controllers.Categories).as('categories').except(['show'])
    router.resource('recargas', controllers.Refills).as('refills').except(['show'])
    router.resource('/:refillId/pacotes', controllers.Packages).as('packages').except(['show'])
    router.resource('consumidores', controllers.Users).as('users').except(['show'])
    router.resource('pagamentos', controllers.Payments).as('payments').only(['index'])
    router.resource('blog', controllers.Posts).as('blog').except(['show'])
  })
  .prefix('dashboard')
  .use(middleware.auth())
