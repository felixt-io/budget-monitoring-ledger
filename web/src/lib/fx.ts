import { format, parseISO, subDays } from 'date-fns'
import { roundTwo } from './money'

const CACHE_KEY = 'fx-cache-v1'
const MAX_LOOKBACK_DAYS = 7

type FxCache = Record<string, number>

const loadCache = (): FxCache => {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as FxCache
  } catch {
    return {}
  }
}

const saveCache = (cache: FxCache) => {
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
}

const cacheKey = (date: string, currency: string) => `${date}|${currency}->HKD`

const getCachedRate = (date: string, currency: string) => {
  const cache = loadCache()
  return cache[cacheKey(date, currency)]
}

const setCachedRate = (date: string, currency: string, rate: number) => {
  const cache = loadCache()
  cache[cacheKey(date, currency)] = rate
  saveCache(cache)
}

const fetchRate = async (date: string, currency: string) => {
  const response = await fetch(
    `https://api.frankfurter.app/${date}?from=${currency}&to=HKD`
  )
  if (!response.ok) {
    throw new Error('Unable to fetch FX rate.')
  }
  const data = (await response.json()) as { rates?: Record<string, number> }
  const rate = data?.rates?.HKD
  if (!rate) {
    throw new Error('Rate unavailable for selected date.')
  }
  return rate
}

export const convertToHkd = async (
  amount: number,
  currency: string,
  date: string
) => {
  if (currency === 'HKD') {
    return {
      hkdAmount: roundTwo(amount),
      fxRate: 1,
      fxDate: date,
    }
  }

  if (!navigator.onLine) {
    const cached = getCachedRate(date, currency)
    if (cached) {
      return {
        hkdAmount: roundTwo(amount * cached),
        fxRate: cached,
        fxDate: date,
      }
    }
    throw new Error('FX rate needs an internet connection or cached rate.')
  }

  const baseDate = parseISO(date)
  for (let i = 0; i <= MAX_LOOKBACK_DAYS; i += 1) {
    const attemptDate = format(subDays(baseDate, i), 'yyyy-MM-dd')
    const cached = getCachedRate(attemptDate, currency)
    if (cached) {
      return {
        hkdAmount: roundTwo(amount * cached),
        fxRate: cached,
        fxDate: attemptDate,
      }
    }

    try {
      const rate = await fetchRate(attemptDate, currency)
      setCachedRate(attemptDate, currency, rate)
      return {
        hkdAmount: roundTwo(amount * rate),
        fxRate: rate,
        fxDate: attemptDate,
      }
    } catch {
      if (i === MAX_LOOKBACK_DAYS) {
        break
      }
    }
  }

  throw new Error('Unable to find an FX rate for that date.')
}
