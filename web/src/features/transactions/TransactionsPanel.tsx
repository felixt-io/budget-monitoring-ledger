import { useMemo, useState } from 'react'
import { categories } from '../../lib/categories'
import { formatCurrency, formatHkd } from '../../lib/money'
import type { Category, TransactionRow } from '../../lib/types'

type TransactionsPanelProps = {
  transactions: TransactionRow[]
  onDelete: (id: string) => Promise<void>
  onUpdateCategory: (id: string, category: Category) => Promise<void>
}

export const TransactionsPanel = ({
  transactions,
  onDelete,
  onUpdateCategory,
}: TransactionsPanelProps) => {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch = tx.item.toLowerCase().includes(search.toLowerCase())
      const matchesCategory =
        categoryFilter === 'All' || tx.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [transactions, search, categoryFilter])

  return (
    <section className="card">
      <div className="card-header">
        <h2>Transactions</h2>
        <span className="muted">{filtered.length} entries</span>
      </div>
      <div className="filters">
        <input
          type="search"
          placeholder="Search items"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
        >
          <option value="All">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      <div className="table">
        <div className="table-head">
          <span>Date</span>
          <span>Item</span>
          <span>Category</span>
          <span>Original</span>
          <span>HKD</span>
          <span />
        </div>
        {filtered.map((tx) => (
          <div key={tx.id} className="table-row">
            <span>{tx.date}</span>
            <span className="item-cell">{tx.item}</span>
            <select
              value={tx.category}
              onChange={(event) =>
                onUpdateCategory(tx.id, event.target.value as Category)
              }
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <span>
              {formatCurrency(tx.original_amount, tx.original_currency)}
            </span>
            <span>{formatHkd(tx.hkd_amount)}</span>
            <button
              className="ghost-button"
              onClick={() => onDelete(tx.id)}
            >
              Delete
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="empty">No transactions found for this filter.</div>
        )}
      </div>
    </section>
  )
}
