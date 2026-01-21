import { useMemo, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { categories, commonCurrencies } from '../../lib/categories'
import { categorizeItem } from '../../lib/categorize'
import { todayHk } from '../../lib/hkTime'
import { parseSmartText } from '../../lib/smartText'
import type { Category, DraftEntry } from '../../lib/types'

type QuickAddCardProps = {
  ruleSet: Record<Category, string[]>
  onSubmit: (entry: DraftEntry) => Promise<void>
  loading?: boolean
}

export const QuickAddCard = ({ ruleSet, onSubmit, loading }: QuickAddCardProps) => {
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('HKD')
  const [item, setItem] = useState('')
  const [date, setDate] = useState(todayHk())
  const [categoryOverride, setCategoryOverride] = useState<Category | ''>('')
  const [smartText, setSmartText] = useState('')
  const [smartError, setSmartError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const autoCategory = useMemo(() => {
    if (!item) return 'Shopping'
    return categorizeItem(item, ruleSet).category
  }, [item, ruleSet])

  const selectedCategory = categoryOverride || autoCategory

  const resetForm = () => {
    setAmount('')
    setItem('')
    setCurrency('HKD')
    setDate(todayHk())
    setCategoryOverride('')
    setFormError(null)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)
    const numericAmount = Number(amount.replace(/,/g, ''))
    if (!numericAmount || numericAmount <= 0) {
      setFormError('Enter a valid amount greater than zero.')
      return
    }
    if (!item.trim()) {
      setFormError('Add a short item or merchant name.')
      return
    }

    await onSubmit({
      amount: numericAmount,
      currency,
      item: item.trim(),
      date,
      category: selectedCategory,
    })
    resetForm()
  }

  const handleSmartKey = async (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return
    event.preventDefault()
    const result = parseSmartText(smartText)
    if (result.error) {
      setSmartError(result.error)
      return
    }

    setSmartError(null)
    setAmount(result.amount?.toString() ?? '')
    setCurrency(result.currency)
    setItem(result.item)
    setDate(result.date)
    setCategoryOverride('')

    await onSubmit({
      amount: result.amount ?? 0,
      currency: result.currency,
      item: result.item,
      date: result.date,
      category: categorizeItem(result.item, ruleSet).category,
    })

    setSmartText('')
    resetForm()
  }

  return (
    <section className="card quick-add">
      <div className="card-header">
        <h2>Quick add</h2>
        <span className="pill">Auto: {autoCategory}</span>
      </div>
      <p className="muted">
        Paste a single line to add fast, or use the detailed fields below.
      </p>
      <label className="smart-input">
        Quick paste (optional)
        <input
          type="text"
          placeholder="68 usd sushi 20260121"
          value={smartText}
          onChange={(event) => setSmartText(event.target.value)}
          onKeyDown={handleSmartKey}
        />
      </label>
      {smartError && <div className="notice">{smartError}</div>}

      <form onSubmit={handleSubmit} className="quick-form">
        <label>
          Amount
          <input
            type="text"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0.00"
            inputMode="decimal"
          />
        </label>
        <label>
          Currency
          <select
            value={currency}
            onChange={(event) => setCurrency(event.target.value)}
          >
            {commonCurrencies.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </label>
        <label>
          Item
          <input
            type="text"
            value={item}
            onChange={(event) => setItem(event.target.value)}
            placeholder="e.g. MTR, cafe latte"
          />
        </label>
        <label>
          Date
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </label>
        <label>
          Category
          <select
            value={selectedCategory}
            onChange={(event) => setCategoryOverride(event.target.value as Category)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <div className="form-actions">
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Add entry'}
          </button>
          {formError && <span className="form-error">{formError}</span>}
        </div>
      </form>
    </section>
  )
}
