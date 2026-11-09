import { DateTime } from 'luxon'

const EXCHANGE_RATES_URL =
  'https://bancoyetu.ao/CatalogSearchServices/ExchangeRatesService/ExchangeRates?currencyBase=AKZ&type=D'

const REQUEST_TIMEOUT_MS = 5000

export type ExchangeRate = {
  currencyBase: string
  currencyTo: string
  buy: number | string
  sell: number | string
  syncDate: string
  /** Data de sincronização já formatada (dd/MM/yyyy) */
  syncTime: string
}

/**
 * Cotações do Kwanza publicadas pelo Banco Yetu.
 */
export default class ExchangeRateService {
  /**
   * Devolve as cotações do dia ou null quando o serviço externo não responde
   * (timeout, erro HTTP ou formato inesperado).
   */
  async today(): Promise<ExchangeRate[] | null> {
    try {
      const response = await fetch(EXCHANGE_RATES_URL, {
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      })

      if (!response.ok) return null

      const json = (await response.json()) as { exchangeRates?: Omit<ExchangeRate, 'syncTime'>[] }
      if (!Array.isArray(json.exchangeRates)) return null

      return json.exchangeRates.map((rate) => ({
        ...rate,
        syncTime: DateTime.fromISO(rate.syncDate).toFormat('dd/MM/yyyy'),
      }))
    } catch {
      return null
    }
  }
}
