/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

router.on('/').render('pages/public/home').as('web.home')
router.on('/sobre-nos').render('pages/public/about').as('web.about')
router.on('/contactos').render('pages/public/contact').as('web.contact')
router.on('/loja').render('pages/public/shop').as('web.shop')
