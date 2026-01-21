import type { Category } from './types'

export const categories: Category[] = [
  'Eating Out',
  'Housing',
  'Groceries',
  'Transportation',
  'Utilities',
  'Medical',
  'Education',
  'Shopping',
  'Entertainment',
  'Insurance',
  'Subscription',
  'Travel',
]

export const starterRules: Record<Category, string[]> = {
  'Eating Out': ['cafe', 'restaurant', 'lunch', 'dinner', 'brunch', 'coffee'],
  Housing: ['rent', 'mortgage', 'landlord', 'property'],
  Groceries: ['market', 'supermarket', 'parknshop', 'wellcome', 'grocery'],
  Transportation: ['mtr', 'taxi', 'uber', 'bus', 'train', 'octopus'],
  Utilities: ['electric', 'water', 'gas', 'utility', 'broadband'],
  Medical: ['doctor', 'clinic', 'hospital', 'pharmacy', 'dental'],
  Education: ['course', 'tuition', 'school', 'class', 'lesson'],
  Shopping: ['mall', 'shop', 'store', 'amazon', 'taobao'],
  Entertainment: ['cinema', 'movie', 'concert', 'game', 'netflix'],
  Insurance: ['insurance', 'premium', 'policy'],
  Subscription: ['subscription', 'spotify', 'apple', 'icloud'],
  Travel: ['hotel', 'flight', 'airline', 'trip', 'booking'],
}

export const commonCurrencies = [
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
