import limiter from '@adonisjs/limiter/services/main'

/**
 * Limite geral para formulários públicos (registo, recuperação de conta...).
 */
export const throttle = limiter.define('global', () => {
  return limiter.allowRequests(10).every('1 minute')
})

/**
 * Tentativas de login: 5 por minuto para o mesmo IP + email; ao exceder,
 * bloqueia durante 5 minutos (trava ataques de força bruta).
 */
export const loginThrottle = limiter.define('login', (ctx) => {
  const email = String(ctx.request.input('email', '')).toLowerCase()

  return limiter
    .allowRequests(5)
    .every('1 minute')
    .blockFor('5 mins')
    .usingKey(`login_${ctx.request.ip()}_${email}`)
})
