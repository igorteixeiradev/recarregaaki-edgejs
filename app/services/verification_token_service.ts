import { createHash, randomBytes } from 'node:crypto'
import { DateTime } from 'luxon'
import VerificationToken from '#models/verification_token'
import { toDbDate } from '#utils/dates'
import type { VerificationTokenType } from '#enums/verification_token_type'

const TOKEN_LIFETIME_HOURS = 1

export default class VerificationTokenService {
  /**
   * Cria um token novo (invalidando os anteriores do mesmo tipo para o email)
   * e devolve o valor em texto simples, que só é enviado por email.
   */
  async issue(email: string, type: VerificationTokenType): Promise<string> {
    const token = randomBytes(32).toString('hex')

    await VerificationToken.query().where('email', email).where('type', type).delete()
    await VerificationToken.create({
      email,
      type,
      token: this.#hash(token),
      expiresAt: DateTime.now().plus({ hours: TOKEN_LIFETIME_HOURS }),
    })

    return token
  }

  /**
   * Valida e consome (uso único) um token. Devolve o email associado ou
   * `null` se o token não existir, tiver expirado ou for de outro tipo.
   */
  async consume(token: string, type: VerificationTokenType): Promise<string | null> {
    const row = await VerificationToken.query()
      .where('token', this.#hash(token))
      .where('type', type)
      .where('expiresAt', '>', toDbDate(DateTime.now()))
      .first()

    if (!row) return null

    // Se dois pedidos usarem o mesmo link em simultâneo, só um apaga a linha
    const deleted = await VerificationToken.query().where('id', row.id).delete()
    const affected = Array.isArray(deleted) ? deleted[0] : deleted

    return Number(affected) > 0 ? row.email : null
  }

  #hash(token: string): string {
    return createHash('sha256').update(token).digest('hex')
  }
}
