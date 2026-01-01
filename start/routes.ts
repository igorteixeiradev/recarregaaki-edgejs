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
const AuthController = () => import('#controllers/auth_controller')

const PATH_TRAVERSAL_REGEX = /(?:^|[\\/])\.\.(?:[\\/]|$)/

router.get('/uploads/*', ({ request, response }) => {
  const filePath = request.param('*').join(sep)
  const normalizedPath = normalize(filePath)

  if (PATH_TRAVERSAL_REGEX.test(normalizedPath)) {
    return response.badRequest('Malformed path')
  }

  const absolutePath = app.makePath('uploads', normalizedPath)
  return response.download(absolutePath)
})

router.on('/').render('pages/public/home').as('web.home')
router.on('/sobre-nos').render('pages/public/about').as('web.about')
router.on('/contactos').render('pages/public/contact').as('web.contact')
router.on('/loja').render('pages/public/shop').as('web.shop')
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
  .on('/resetar-palavra-passe')
  .render('pages/public/auth/reset-password')
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
