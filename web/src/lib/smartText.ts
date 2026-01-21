import { isValid, parseISO } from 'date-fns'
import { todayHk } from './hkTime'

const currencyAliases: Record<string, string> = {
  'HK$': 'HKD',
  'US$': 'USD',
  RMB: 'CNY',
}

const isoCurrencies = [
  'HKD',
  'USD',
  'CNY',
  'JPY',
  'EUR',
  'GBP',
  'AUD',
  'CAD',
  'SGD',
  'TWD',
  'KRW',
  'THB',
]

export type SmartTextResult = {
  amount?: number
  currency: string
  item: string
  date: string
  error?: string
}

const normalizeCurrency = (token: string) => {
  const upper = token.toUpperCase()
  if (currencyAliases[upper]) return currencyAliases[upper]
  if (isoCurrencies.includes(upper)) return upper
  return null
}

const parseAmount = (token: string) => {
  if (!/^\d[\d,]*\.?\d*$/.test(token)) return null
  const value = Number(token.replace(/,/g, ''))
  if (!Number.isFinite(value) || value <= 0) return null
  return value
}

const parseDateToken = (token: string) => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(token)) {
    const date = parseISO(token)
    if (isValid(date)) return token
    return null
  }

  if (/^\d{8}$/.test(token)) {
    const formatted = `${token.slice(0, 4)}-${token.slice(4, 6)}-${token.slice(6, 8)}`
    const date = parseISO(formatted)
    if (isValid(date)) return formatted
  }

  return null
}

export const parseSmartText = (input: string): SmartTextResult => {
  const tokens = input.trim().split(/\s+/).filter(Boolean)
  const defaultDate = todayHk()
  let amount: number | undefined
  let currency = 'HKD'
  let date = defaultDate
  const itemParts: string[] = []

  for (const token of tokens) {
    const dateToken = parseDateToken(token)
    if (dateToken && date === defaultDate) {
      date = dateToken
      continue
    }

    const compactMatch = token.match(/^(\d[\d,]*\.?\d*)([a-zA-Z]{3}|HK\$|US\$|RMB)$/)
    if (compactMatch && amount === undefined) {
      const compactAmount = parseAmount(compactMatch[1])
      const compactCurrency = normalizeCurrency(compactMatch[2])
      if (compactAmount && compactCurrency) {
        amount = compactAmount
        currency = compactCurrency
        continue
      }
    }

    const currencyToken = normalizeCurrency(token)
    if (currencyToken && currency === 'HKD') {
      currency = currencyToken
      continue
    }

    const amountToken = parseAmount(token)
    if (amountToken !== null && amount === undefined) {
      amount = amountToken
      continue
    }

    itemParts.push(token)
  }

  const item = itemParts.join(' ').trim()
  if (!amount) {
    return {
      currency,
      item,
      date,
      error: 'Enter an amount in the quick paste line.',
    }
  }

  if (!item) {
    return {
      amount,
      currency,
      item,
      date,
      error: 'Add a short item or merchant name.',
    }
  }

  return {
    amount,
    currency,
    item,
    date,
  }
}
