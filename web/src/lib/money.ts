export const roundTwo = (value: number) => Math.round(value * 100) / 100

export const formatHkd = (value: number) =>
  new Intl.NumberFormat('en-HK', {
    style: 'currency',
    currency: 'HKD',
    maximumFractionDigits: 2,
  }).format(value)

export const formatCurrency = (value: number, currency: string) =>
  new Intl.NumberFormat('en-HK', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value)
