import type { DateTime } from 'luxon'

/**
 * Formato em que o Lucid guarda datas no SQLite ("2026-10-12 06:54:02"), no
 * fuso da própria data. Usar sempre que for preciso comparar uma coluna de
 * data com um valor em queries (where/whereBetween), para os formatos coincidirem.
 */
export function toDbDate(date: DateTime): string {
  return date.toFormat('yyyy-MM-dd HH:mm:ss')
}
