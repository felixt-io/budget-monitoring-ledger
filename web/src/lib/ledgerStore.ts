import { format, parseISO, subDays } from 'date-fns'
import { roundTwo } from './money'
import { todayHk } from './hkTime'
import { isDemoMode } from './runtime'
import { supabase } from './supabase'
import type { Category, CategoryRuleRow, DraftEntry, TransactionRow } from './types'

const DEMO_TRANSACTIONS_KEY = 'demo-transactions-v1'
const DEMO_RULES_KEY = 'demo-rules-v1'

const getId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `demo-${Math.random().toString(36).slice(2, 10)}`

const seedDemoTransactions = (): TransactionRow[] => {
  const baseDate = parseISO(todayHk())
  const makeDate = (offset: number) => format(subDays(baseDate, offset), 'yyyy-MM-dd')

  const sample = [
    {
      item: 'MTR top-up',
      category: 'Transportation' as Category,
      original_amount: 200,
      original_currency: 'HKD',
      fx_rate: 1,
    },
    {
      item: 'Coffee + pastry',
      category: 'Eating Out' as Category,
      original_amount: 58,
      original_currency: 'HKD',
      fx_rate: 1,
    },
    {
      item: 'Groceries - ParknShop',
      category: 'Groceries' as Category,
      original_amount: 286.5,
      original_currency: 'HKD',
      fx_rate: 1,
    },
    {
      item: 'Taxi to client site',
      category: 'Transportation' as Category,
      original_amount: 120,
      original_currency: 'HKD',
      fx_rate: 1,
    },
    {
      item: 'Phone plan',
      category: 'Utilities' as Category,
      original_amount: 168,
      original_currency: 'HKD',
      fx_rate: 1,
    },
    {
      item: 'Lunch - udon',
      category: 'Eating Out' as Category,
      original_amount: 72,
      original_currency: 'HKD',
      fx_rate: 1,
    },
    {
      item: 'Weekend cinema',
      category: 'Entertainment' as Category,
      original_amount: 110,
      original_currency: 'HKD',
      fx_rate: 1,
    },
    {
      item: 'Flight booking',
      category: 'Travel' as Category,
      original_amount: 320,
      original_currency: 'USD',
      fx_rate: 7.8,
    },
    {
      item: 'Hotel deposit',
      category: 'Travel' as Category,
      original_amount: 200,
      original_currency: 'USD',
      fx_rate: 7.8,
    },
    {
      item: 'Subway pass',
      category: 'Transportation' as Category,
      original_amount: 1200,
      original_currency: 'JPY',
      fx_rate: 0.054,
    },
    {
      item: 'Museum ticket',
      category: 'Entertainment' as Category,
      original_amount: 18,
      original_currency: 'EUR',
      fx_rate: 8.6,
    },
    {
      item: 'Health check',
      category: 'Medical' as Category,
      original_amount: 420,
      original_currency: 'HKD',
      fx_rate: 1,
    },
    {
      item: 'Home supplies',
      category: 'Shopping' as Category,
      original_amount: 260,
      original_currency: 'HKD',
      fx_rate: 1,
    },
  ]

  return sample.map((entry, index) => {
    const date = makeDate(index)
    const hkdAmount = roundTwo(entry.original_amount * entry.fx_rate)
    return {
      id: getId(),
      user_id: 'demo',
      date,
      item: entry.item,
      category: entry.category,
      original_amount: entry.original_amount,
      original_currency: entry.original_currency,
      hkd_amount: hkdAmount,
      fx_rate: entry.fx_rate,
      fx_date: date,
      created_at: new Date().toISOString(),
    }
  })
}

const seedDemoRules = (): CategoryRuleRow[] => [
  {
    id: getId(),
    user_id: 'demo',
    category: 'Transportation',
    keyword: 'mtr',
    created_at: new Date().toISOString(),
  },
  {
    id: getId(),
    user_id: 'demo',
    category: 'Eating Out',
    keyword: 'udon',
    created_at: new Date().toISOString(),
  },
  {
    id: getId(),
    user_id: 'demo',
    category: 'Groceries',
    keyword: 'parknshop',
    created_at: new Date().toISOString(),
  },
]

const loadDemoData = <T>(key: string, fallback: () => T): T => {
  const raw = localStorage.getItem(key)
  if (raw) {
    try {
      return JSON.parse(raw) as T
    } catch {
      localStorage.removeItem(key)
    }
  }
  const seeded = fallback()
  localStorage.setItem(key, JSON.stringify(seeded))
  return seeded
}

const saveDemoData = <T>(key: string, value: T) => {
  localStorage.setItem(key, JSON.stringify(value))
}

const ensureDemoSeed = () => {
  loadDemoData(DEMO_TRANSACTIONS_KEY, seedDemoTransactions)
  loadDemoData(DEMO_RULES_KEY, seedDemoRules)
}

export type LedgerStore = {
  listRules: (userId?: string) => Promise<CategoryRuleRow[]>
  addRule: (userId: string | undefined, category: Category, keyword: string) => Promise<void>
  deleteRule: (userId: string | undefined, id: string) => Promise<void>
  listTransactions: (
    userId: string | undefined,
    start: string,
    end: string
  ) => Promise<TransactionRow[]>
  addTransaction: (
    userId: string | undefined,
    entry: DraftEntry,
    fx: { hkdAmount: number; fxRate: number; fxDate: string }
  ) => Promise<TransactionRow>
  deleteTransaction: (userId: string | undefined, id: string) => Promise<void>
  updateTransactionCategory: (
    userId: string | undefined,
    id: string,
    category: Category
  ) => Promise<void>
  exportJson: (userId: string | undefined) => Promise<{ transactions: TransactionRow[]; rules: CategoryRuleRow[] }>
  resetDemo?: () => void
}

const demoStore: LedgerStore = {
  listRules: async () => {
    ensureDemoSeed()
    return loadDemoData(DEMO_RULES_KEY, seedDemoRules)
  },
  addRule: async (_userId, category, keyword) => {
    ensureDemoSeed()
    const rules = loadDemoData(DEMO_RULES_KEY, seedDemoRules)
    rules.push({
      id: getId(),
      user_id: 'demo',
      category,
      keyword: keyword.trim().toLowerCase(),
      created_at: new Date().toISOString(),
    })
    saveDemoData(DEMO_RULES_KEY, rules)
  },
  deleteRule: async (_userId, id) => {
    ensureDemoSeed()
    const rules = loadDemoData(DEMO_RULES_KEY, seedDemoRules)
    saveDemoData(
      DEMO_RULES_KEY,
      rules.filter((rule) => rule.id !== id)
    )
  },
  listTransactions: async (_userId, start, end) => {
    ensureDemoSeed()
    const list = loadDemoData(DEMO_TRANSACTIONS_KEY, seedDemoTransactions)
    return list
      .filter((tx) => tx.date >= start && tx.date < end)
      .sort((a, b) => (a.date < b.date ? 1 : -1))
  },
  addTransaction: async (_userId, entry, fx) => {
    ensureDemoSeed()
    const list = loadDemoData(DEMO_TRANSACTIONS_KEY, seedDemoTransactions)
    const tx: TransactionRow = {
      id: getId(),
      user_id: 'demo',
      date: entry.date,
      item: entry.item,
      category: entry.category,
      original_amount: entry.amount,
      original_currency: entry.currency,
      hkd_amount: fx.hkdAmount,
      fx_rate: fx.fxRate,
      fx_date: fx.fxDate,
      created_at: new Date().toISOString(),
    }
    list.unshift(tx)
    saveDemoData(DEMO_TRANSACTIONS_KEY, list)
    return tx
  },
  deleteTransaction: async (_userId, id) => {
    ensureDemoSeed()
    const list = loadDemoData(DEMO_TRANSACTIONS_KEY, seedDemoTransactions)
    saveDemoData(
      DEMO_TRANSACTIONS_KEY,
      list.filter((tx) => tx.id !== id)
    )
  },
  updateTransactionCategory: async (_userId, id, category) => {
    ensureDemoSeed()
    const list = loadDemoData(DEMO_TRANSACTIONS_KEY, seedDemoTransactions)
    const updated = list.map((tx) => (tx.id === id ? { ...tx, category } : tx))
    saveDemoData(DEMO_TRANSACTIONS_KEY, updated)
  },
  exportJson: async () => {
    ensureDemoSeed()
    return {
      transactions: loadDemoData(DEMO_TRANSACTIONS_KEY, seedDemoTransactions),
      rules: loadDemoData(DEMO_RULES_KEY, seedDemoRules),
    }
  },
  resetDemo: () => {
    localStorage.removeItem(DEMO_TRANSACTIONS_KEY)
    localStorage.removeItem(DEMO_RULES_KEY)
    ensureDemoSeed()
  },
}

const supabaseStore: LedgerStore = {
  listRules: async (userId) => {
    if (!userId || !supabase) return []
    const { data } = await supabase.from('category_rules').select('*').order('created_at')
    return (data ?? []) as CategoryRuleRow[]
  },
  addRule: async (userId, category, keyword) => {
    if (!userId || !supabase) return
    await supabase.from('category_rules').insert({
      category,
      keyword: keyword.trim().toLowerCase(),
    })
  },
  deleteRule: async (userId, id) => {
    if (!userId || !supabase) return
    await supabase.from('category_rules').delete().eq('id', id)
  },
  listTransactions: async (userId, start, end) => {
    if (!userId || !supabase) return []
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .gte('date', start)
      .lt('date', end)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
    return (data ?? []) as TransactionRow[]
  },
  addTransaction: async (userId, entry, fx) => {
    if (!userId || !supabase) {
      throw new Error('Missing user session.')
    }
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        date: entry.date,
        item: entry.item,
        category: entry.category,
        original_amount: entry.amount,
        original_currency: entry.currency,
        hkd_amount: fx.hkdAmount,
        fx_rate: fx.fxRate,
        fx_date: fx.fxDate,
      })
      .select('*')
      .single()

    if (error) {
      throw error
    }

    return data as TransactionRow
  },
  deleteTransaction: async (userId, id) => {
    if (!userId || !supabase) return
    await supabase.from('transactions').delete().eq('id', id)
  },
  updateTransactionCategory: async (userId, id, category) => {
    if (!userId || !supabase) return
    await supabase.from('transactions').update({ category }).eq('id', id)
  },
  exportJson: async (userId) => {
    if (!userId || !supabase) {
      return { transactions: [], rules: [] }
    }
    const [tx, rules] = await Promise.all([
      supabase.from('transactions').select('*'),
      supabase.from('category_rules').select('*'),
    ])
    return {
      transactions: (tx.data ?? []) as TransactionRow[],
      rules: (rules.data ?? []) as CategoryRuleRow[],
    }
  },
}

export const getLedgerStore = (): LedgerStore => (isDemoMode ? demoStore : supabaseStore)
