import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { categories } from '../lib/categories'
import { getLedgerStore } from '../lib/ledgerStore'
import { isDemoMode } from '../lib/runtime'
import type { Category, CategoryRuleRow } from '../lib/types'
import { useAuth } from '../app/useAuth'

export const SettingsPage = () => {
  const { user } = useAuth()
  const [rules, setRules] = useState<CategoryRuleRow[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category>('Eating Out')
  const [keyword, setKeyword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const store = useMemo(() => getLedgerStore(), [])
  const userId = isDemoMode ? 'demo' : user?.id

  const loadRules = useCallback(async () => {
    if (!userId) return
    const data = await store.listRules(userId)
    setRules(data)
  }, [store, userId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadRules()
  }, [loadRules])

  const handleAdd = async (event: FormEvent) => {
    event.preventDefault()
    const cleaned = keyword.trim().toLowerCase()
    if (!cleaned) return

    try {
      await store.addRule(userId, selectedCategory, cleaned)
      setKeyword('')
      setMessage(null)
      await loadRules()
    } catch (err) {
      if (err instanceof Error) {
        setMessage(err.message)
      } else {
        setMessage('Unable to add rule.')
      }
    }
  }

  const handleDelete = async (id: string) => {
    await store.deleteRule(userId, id)
    await loadRules()
  }

  const rulesForCategory = rules.filter((rule) => rule.category === selectedCategory)

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Settings</h1>
        <p className="muted">
          Manage your category rules and exports.
          {isDemoMode && ' Demo data stays in this browser.'}
        </p>
      </div>

      <section className="card">
        <h2>Category rules</h2>
        <p className="muted">Add keywords to improve auto-categorization.</p>
        <div className="rule-controls">
          <label>
            Category
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value as Category)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <form onSubmit={handleAdd} className="rule-form">
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Add keyword e.g. uber"
              required
            />
            <button className="primary-button" type="submit">
              Add rule
            </button>
          </form>
        </div>
        {message && <div className="notice">{message}</div>}
        <div className="rule-list">
          {rulesForCategory.length === 0 ? (
            <p className="muted">No rules yet for {selectedCategory}.</p>
          ) : (
            rulesForCategory.map((rule) => (
              <div key={rule.id} className="rule-item">
                <span>{rule.keyword}</span>
                <button className="ghost-button" onClick={() => handleDelete(rule.id)}>
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="card">
        <h2>Data export</h2>
        <p className="muted">Download your transactions and rules as JSON.</p>
        <button
          className="ghost-button"
          onClick={async () => {
            const data = await store.exportJson(userId)
            const blob = new Blob([
              JSON.stringify(
                data,
                null,
                2
              ),
            ])
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `budget-export-${new Date().toISOString().slice(0, 10)}.json`
            link.click()
            URL.revokeObjectURL(url)
          }}
        >
          Export JSON
        </button>
        {isDemoMode && store.resetDemo && (
          <button
            className="ghost-button"
            onClick={() => {
              store.resetDemo?.()
              void loadRules()
            }}
          >
            Reset demo data
          </button>
        )}
      </section>
    </div>
  )
}
