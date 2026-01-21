export type Category =
  | 'Eating Out'
  | 'Housing'
  | 'Groceries'
  | 'Transportation'
  | 'Utilities'
  | 'Medical'
  | 'Education'
  | 'Shopping'
  | 'Entertainment'
  | 'Insurance'
  | 'Subscription'
  | 'Travel'

export type TransactionRow = {
  id: string
  user_id: string
  date: string
  item: string
  category: Category
  original_amount: number
  original_currency: string
  hkd_amount: number
  fx_rate: number
  fx_date: string
  created_at: string
}

export type CategoryRuleRow = {
  id: string
  user_id: string
  category: Category
  keyword: string
  created_at: string
}

export type DraftEntry = {
  amount: number
  currency: string
  item: string
  date: string
  category: Category
}
