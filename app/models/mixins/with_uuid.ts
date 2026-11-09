import { randomUUID } from 'node:crypto'
import { BaseModel, beforeCreate } from '@adonisjs/lucid/orm'
import type { NormalizeConstructor } from '@adonisjs/core/types/helpers'

/**
 * Gera o UUID da chave primária na aplicação (o SQLite não o faz).
 * A coluna 'id' vem da classe de schema gerada pelo Lucid.
 */
export function withUuid() {
  return <Model extends NormalizeConstructor<typeof BaseModel>>(superclass: Model) => {
    class UuidModel extends superclass {
      static selfAssignPrimaryKey = true

      declare id: string

      @beforeCreate()
      static assignUuid(model: UuidModel) {
        model.id ??= randomUUID()
      }
    }

    return UuidModel
  }
}
