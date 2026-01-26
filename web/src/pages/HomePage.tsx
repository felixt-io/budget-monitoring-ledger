import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  addMonths,
  eachDayOfInterval,
  format,
  getDaysInMonth,
  parseISO,
  subDays,
} from 'date-fns'
import { categories } from '../lib/categories'
import { buildRuleSet } from '../lib/categorize'
import { convertToHkd } from '../lib/fx'
import { monthLabelHk, monthStartHk, nextMonthStartHk, todayHk } from '../lib/hkTime'
import { formatHkd } from '../lib/money'
import { getLedgerStore } from '../lib/ledgerStore'
import { isDemoMode } from '../lib/runtime'
import type { Category, CategoryRuleRow, DraftEntry, TransactionRow } from '../lib/types'
import { useAuth } from '../app/useAuth'
import { QuickAddCard } from '../features/entry/QuickAddCard'
import { KpiRow } from '../features/stats/KpiRow'
import { CategoryBarChart } from '../features/stats/CategoryBarChart'
import { DailySpendLineChart } from '../features/stats/DailySpendLineChart'
import { TransactionsPanel } from '../features/transactions/TransactionsPanel'

export const HomePage = () => {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<TransactionRow[]>([])
  const [rules, setRules] = useState<CategoryRuleRow[]>([])
  const [monthDate, setMonthDate] = useState(() => parseISO(todayHk()))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const store = useMemo(() => getLedgerStore(), [])
  const userId = isDemoMode ? 'demo' : user?.id

  const ruleSet = useMemo(() => buildRuleSet(rules), [rules])

  const loadRules = useCallback(async () => {
    if (!userId) return
    const data = await store.listRules(userId)
    setRules(data)
  }, [store, userId])

  const loadTransactions = useCallback(async () => {
    if (!userId) return
    const monthStart = monthStartHk(monthDate)
    const nextMonthStart = nextMonthStartHk(monthDate)

    try {
      const data = await store.listTransactions(userId, monthStart, nextMonthStart)
      setTransactions(data)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Unable to load transactions.')
      }
    }
  }, [monthDate, store, userId])

  useEffect(() => {
    void loadRules()
  }, [loadRules])

  useEffect(() => {
    void loadTransactions()
  }, [loadTransactions])

  const handleAddEntry = async (entry: DraftEntry) => {
    if (!userId) return
    setLoading(true)
    setError(null)
    try {
      const fx = await convertToHkd(entry.amount, entry.currency, entry.date)
      const data = await store.addTransaction(userId, entry, fx)
      setTransactions((prev) => [data, ...prev])
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Unable to add entry.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!userId) return
    if (!window.confirm('Delete this entry? This cannot be undone.')) return
    await store.deleteTransaction(userId, id)
    setTransactions((prev) => prev.filter((tx) => tx.id !== id))
  }

  const handleUpdateCategory = async (id: string, category: Category) => {
    if (!userId) return
    await store.updateTransactionCategory(userId, id, category)
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? { ...tx, category } : tx))
    )
  }

  const monthStart = monthStartHk(monthDate)
  const nextMonthStart = nextMonthStartHk(monthDate)

  const totalsByCategory = useMemo(() => {
    return categories.map((category) => ({
      category,
      total: transactions
        .filter((tx) => tx.category === category)
        .reduce((sum, tx) => sum + tx.hkd_amount, 0),
    }))
  }, [transactions])

  const total = totalsByCategory.reduce((sum, cat) => sum + cat.total, 0)
  const daysInMonth = getDaysInMonth(parseISO(monthStart))
  const dailyAverage = daysInMonth ? total / daysInMonth : 0
  const topCategoryData = [...totalsByCategory].sort((a, b) => b.total - a.total)[0]
  const largestExpense = [...transactions].sort((a, b) => b.hkd_amount - a.hkd_amount)[0]

  const dailyTotals = useMemo(() => {
    const start = parseISO(monthStart)
    const end = subDays(parseISO(nextMonthStart), 1)
    const days = eachDayOfInterval({ start, end })
    const map = new Map<string, number>()
    transactions.forEach((tx) => {
      map.set(tx.date, (map.get(tx.date) ?? 0) + tx.hkd_amount)
    })

    return days.map((day) => {
      const label = format(day, 'd')
      const iso = format(day, 'yyyy-MM-dd')
      return {
        date: label,
        total: map.get(iso) ?? 0,
      }
    })
  }, [transactions, monthStart, nextMonthStart])

  return (
    <div className="home-page">
      <div className="page-header">
        <div>
          <h1>{monthLabelHk(monthDate)}</h1>
          <p className="muted">Tracking in Hong Kong time.</p>
        </div>
        <div className="month-controls">
          <button
            className="ghost-button"
            onClick={() => setMonthDate((prev) => addMonths(prev, -1))}
          >
            Previous
          </button>
          <button
            className="ghost-button"
            onClick={() => setMonthDate((prev) => addMonths(prev, 1))}
          >
            Next
          </button>
        </div>
      </div>

      {error && <div className="notice">{error}</div>}

      <div className="grid-2">
        <QuickAddCard ruleSet={ruleSet} onSubmit={handleAddEntry} loading={loading} />
        <div className="summary-card">
          <h2>Month summary</h2>
          <p className="muted">{transactions.length} entries saved</p>
          <div className="summary-total">{formatHkd(total)}</div>
          <div className="summary-meta">
            <span>FX conversions stored per entry.</span>
            <span>
              Range: {monthStart} to {nextMonthStart}
            </span>
          </div>
        </div>
      </div>

      <KpiRow
        total={total}
        dailyAverage={dailyAverage}
        topCategory={topCategoryData?.category ?? '--'}
        topCategorySpend={topCategoryData?.total ?? 0}
        largestExpenseLabel={largestExpense?.item ?? '--'}
        largestExpenseAmount={largestExpense?.hkd_amount ?? 0}
      />

      <div className="grid-2">
        <CategoryBarChart data={totalsByCategory} />
        <DailySpendLineChart data={dailyTotals} />
      </div>

      <TransactionsPanel
        transactions={transactions}
        onDelete={handleDelete}
        onUpdateCategory={handleUpdateCategory}
      />
    </div>
  )
}
