/*
|--------------------------------------------------------------------------
| Bouncer abilities
|--------------------------------------------------------------------------
|
| Abilities são verificações simples, sem recurso associado. As regras por
| recurso (categorias, recargas, pacotes, ...) vivem em `app/policies`.
|
*/

import type User from '#models/user'
import { Bouncer } from '@adonisjs/bouncer'

export const isAdmin = Bouncer.ability((user: User) => user.isAdmin)
