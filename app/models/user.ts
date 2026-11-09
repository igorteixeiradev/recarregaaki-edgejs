import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { UserSchema } from '#database/schema'
import { withUuid } from '#models/mixins/with_uuid'

export default class User extends compose(UserSchema, withUuid(), withAuthFinder(hash)) {}
