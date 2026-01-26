import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { categories } from '../lib/categories'
import { supabase } from '../lib/supabase'
import type { Category, CategoryRuleRow } from '../lib/types'

export const SettingsPage = () => {
  const [rules, setRules] = useState<CategoryRuleRow[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category>('Eating Out')
  const [keyword, setKeyword] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  const loadRules = async () => {
    const { data } = await supabase.from('category_rules').select('*').order('created_at')
    setRules((data ?? []) as CategoryRuleRow[])
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadRules()
  }, [])

  const handleAdd = async (event: FormEvent) => {
    event.preventDefault()
    const cleaned = keyword.trim().toLowerCase()
    if (!cleaned) return

    const { error } = await supabase.from('category_rules').insert({
      category: selectedCategory,
      keyword: cleaned,
    })

    if (error) {
      setMessage(error.message)
      return
    }

    setKeyword('')
    setMessage(null)
    await loadRules()
  }

  const handleDelete = async (id: string) => {
    await supabase.from('category_rules').delete().eq('id', id)
    await loadRules()
  }

  const rulesForCategory = rules.filter((rule) => rule.category === selectedCategory)

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Settings</h1>
        <p className="muted">Manage your category rules and exports.</p>
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
            const [tx, rulesData] = await Promise.all([
              supabase.from('transactions').select('*'),
              supabase.from('category_rules').select('*'),
            ])
            const blob = new Blob([
              JSON.stringify(
                {
                  transactions: tx.data ?? [],
                  rules: rulesData.data ?? [],
                },
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
      </section>
    </div>
  )
}
