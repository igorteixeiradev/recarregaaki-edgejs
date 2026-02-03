/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import app from '@adonisjs/core/services/app'
import { sep, normalize } from 'node:path'
import env from './env.js'
const AuthController = () => import('#controllers/auth_controller')
const PrivatesController = () => import('#controllers/privates_controller')
const PublicsController = () => import('#controllers/publics_controller')
const CategoriesController = () => import('#controllers/categories_controller')
const RefillsController = () => import('#controllers/refills_controller')
const PackagesController = () => import('#controllers/packages_controller')
const UsersController = () => import('#controllers/users_controller')
const PaymentsController = () => import('#controllers/payments_controller')
const PostsController = () => import('#controllers/posts_controller')

// Rota de Uploads de Imagem
const PATH_TRAVERSAL_REGEX = /(?:^|[\\/])\.\.(?:[\\/]|$)/

router.get('uploads/*', ({ request, response }) => {
  const filePath = request.param('*').join(sep)
  const normalizedPath = normalize(filePath)

  if (PATH_TRAVERSAL_REGEX.test(normalizedPath)) {
    return response.badRequest('Malformed path')
  }

  const absolutePath = app.makePath('uploads', normalizedPath)
  return response.download(absolutePath)
})

// Rotas Publicas
router.get('/', [PublicsController, 'index']).as('web.home')
router.on('/sobre-nos').render('pages/public/about').as('web.about')
router.on('/contactos').render('pages/public/contact').as('web.contact')
router.get('/loja', [PublicsController, 'shop']).as('web.shop')
router.get('/blog', [PublicsController, 'blog']).as('web.blog')
router.get('/blog/:id', [PublicsController, 'showBlogPost']).as('web.showBlogPost')
router.get('/loja/:id', [PublicsController, 'show']).as('web.show')
router.on('/perfil').render('pages/public/profile').as('web.profile').use(middleware.auth())

// Paginas de Autenticação
router.on('/entrar').render('pages/public/auth/login').as('auth.login.view').use(middleware.guest())
router
  .on('/registar-se')
  .render('pages/public/auth/register')
  .as('auth.register.view')
  .use(middleware.guest())
router
  .on('/esqueceu-palavra-passe')
  .render('pages/public/auth/forgot-password')
  .as('auth.forgot-password.view')
  .use(middleware.guest())
router
  .get('/resetar-palavra-passe', async (ctx) => {
    const token = ctx.request.input('token')
    return ctx.view.render('pages/public/auth/reset-password', { token })
  })
  .as('auth.reset-password.view')
  .use(middleware.guest())

// Rotas HTTP de Autenticação
router.post('/entrar', [AuthController, 'login']).as('auth.login')
router.post('/registar-se', [AuthController, 'store']).as('auth.store')
router
  .post('/esqueceu-palavra-passe', [AuthController, 'forgotPassword'])
  .as('auth.forgot-password')
router.post('/resetar-palavra-passe', [AuthController, 'resetPassword']).as('auth.reset-password')
router
  .get('/logout', async (ctx) => {
    ctx.auth.use('web').logout()
    ctx.response.redirect().toRoute('web.home')
  })
  .use(middleware.auth())
  .as('auth.logout')
router.get('/verificar-email', [AuthController, 'verifyEmail']).as('auth.verifyEmail')
// Rotas Privadas
router
  .group(() => {
    router.get('', [PrivatesController, 'index']).as('dashboard.index')
    router.get('/kwanza-hoje', [PrivatesController, 'KzToDay']).as('dashboard.kz')
    router.resource('categorias', CategoriesController).as('categories')
    router.resource('recargas', RefillsController).as('refills')
    router.resource('/:refillId/pacotes', PackagesController).as('packages')
    router.resource('consumidores', UsersController).as('users')
    router.resource('pagamentos', PaymentsController).as('payments')
    router.resource('blog', PostsController).as('blog')
  })
  .prefix('dashboard')
  .use(middleware.auth())

if (env.get('NODE_ENV') === 'development') {
  router.jobs('/my-jobs-dashboard')
}
