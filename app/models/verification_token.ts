import { compose } from '@adonisjs/core/helpers'
import { VerificationTokenSchema } from '#database/schema'
import { withUuid } from '#models/mixins/with_uuid'
import type { VerificationTokenType } from '#enums/verification_token_type'

export default class VerificationToken extends compose(VerificationTokenSchema, withUuid()) {
  declare type: VerificationTokenType
}
