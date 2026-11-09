/**
 * Regras partilhadas para imagens enviadas pelo painel.
 *
 * O SVG fica de fora de propósito: os ficheiros são servidos na mesma origem
 * da aplicação e um SVG aberto diretamente no browser pode executar scripts.
 */
export const imageRules = {
  size: '2mb',
  extnames: ['jpg', 'jpeg', 'png', 'webp'],
}
