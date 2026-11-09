import { randomUUID } from 'node:crypto'
import drive from '@adonisjs/drive/services/main'
import type { MultipartFile } from '@adonisjs/core/bodyparser'

/**
 * Prefixo público dos ficheiros (ver 'routeBasePath' em config/drive.ts).
 * Na base de dados guardamos 'uploads/<chave>', que as views usam como '/<valor>'.
 */
const PUBLIC_PREFIX = 'uploads/'

/**
 * Guarda e remove imagens através do @adonisjs/drive.
 */
export default class ImageStorageService {
  async store(file: MultipartFile): Promise<string> {
    const key = `${randomUUID()}.${file.extname ?? 'bin'}`
    await file.moveToDisk(key)
    return PUBLIC_PREFIX + key
  }

  /**
   * Ignora imagens que não foram enviadas (ex: a imagem por defeito em /images).
   */
  async remove(storedPath: string | null | undefined): Promise<void> {
    if (!storedPath?.startsWith(PUBLIC_PREFIX)) return
    await drive.use().delete(storedPath.slice(PUBLIC_PREFIX.length))
  }
}
