/**
 * Caractere de escape usado nas queries LIKE (ver `likeEscapeClause`).
 */
const ESCAPE_CHAR = '\\'

/**
 * Escapa os caracteres especiais do LIKE (%, _ e o próprio escape) para que o
 * texto pesquisado seja tratado literalmente (ex: "100%" não deve devolver tudo).
 * Usar sempre em conjunto com `likeEscapeClause` na query.
 */
export function escapeLike(text: string): string {
  return text.replace(/[\\%_]/g, (char) => ESCAPE_CHAR + char)
}

/**
 * Fragmento SQL que declara o caractere de escape (o SQLite não tem um por defeito).
 */
export const likeEscapeClause = `ESCAPE '${ESCAPE_CHAR}'`
