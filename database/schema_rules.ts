import type { SchemaRules } from '@adonisjs/lucid/types/schema_generator'

/**
 * O SQLite não tem tipo booleano: devolve 0/1. Esta regra faz o gerador de
 * schema converter sempre para true/false ao ler da base de dados.
 */
export default {
  types: {
    boolean: {
      tsType: 'boolean',
      imports: [],
      decorators: [{ name: '@column', args: { consume: (value: unknown) => Boolean(value) } }],
    },
  },
} satisfies SchemaRules
