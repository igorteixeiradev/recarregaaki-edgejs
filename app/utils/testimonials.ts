const testimonials = [
  {
    name: 'Herman Bartolomeu',
    title: 'Jogador Clash of Clans',
    image: '/clients/herman-bartolomeu.jpeg',
    comment: 'A plataforma é incrível! Fiz minha recarga em segundos e sem problemas.',
  },
  {
    name: 'Igor Teixeira',
    title: 'Jogador de Delta Force',
    image: '/clients/igor-teixeira.jpeg',
    comment: 'Super rápido e confiável. Recomendo para todos que jogam online.',
  },
  {
    name: 'Ricardo Ramalhoso',
    title: 'Jogador de Clash Royale',
    image: '/clients/ricardo-ramalhoso.jpeg',
    comment: 'Excelente serviço. As recargas chegam instantaneamente e o suporte é top.',
  },
]

/**
 * Testemunhos agrupados de 2 em 2 para o carrossel da página inicial.
 */
export function testimonialSlides() {
  const slides: (typeof testimonials)[] = []
  for (let i = 0; i < testimonials.length; i += 2) {
    slides.push(testimonials.slice(i, i + 2))
  }
  return slides
}
