import { starterRules } from './categories'
import type { Category, CategoryRuleRow } from './types'

type MatchResult = {
  category: Category
  score: number
  exactMatches: number
  matchedKeywords: string[]
}

export const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

export const buildRuleSet = (userRules: CategoryRuleRow[]) => {
  const ruleSet: Record<Category, string[]> = {
    'Eating Out': [...starterRules['Eating Out']],
    Housing: [...starterRules.Housing],
    Groceries: [...starterRules.Groceries],
    Transportation: [...starterRules.Transportation],
    Utilities: [...starterRules.Utilities],
    Medical: [...starterRules.Medical],
    Education: [...starterRules.Education],
    Shopping: [...starterRules.Shopping],
    Entertainment: [...starterRules.Entertainment],
    Insurance: [...starterRules.Insurance],
    Subscription: [...starterRules.Subscription],
    Travel: [...starterRules.Travel],
  }

  userRules.forEach((rule) => {
    const keyword = normalizeText(rule.keyword)
    if (!keyword) return
    const list = ruleSet[rule.category]
    if (!list.includes(keyword)) {
      list.push(keyword)
    }
  })

  return ruleSet
}

export const categorizeItem = (
  item: string,
  ruleSet: Record<Category, string[]>
): MatchResult => {
  const normalized = normalizeText(item)
  const words = normalized.split(' ').filter(Boolean)

  const results = Object.entries(ruleSet).map(([category, keywords]) => {
    let score = 0
    let exactMatches = 0
    const matchedKeywords: string[] = []

    keywords.forEach((keyword) => {
      if (!keyword) return
      if (words.includes(keyword)) {
        score += 3
        exactMatches += 1
        matchedKeywords.push(keyword)
      } else if (normalized.includes(keyword)) {
        score += 1
        matchedKeywords.push(keyword)
      }
    })

    return {
      category: category as Category,
      score,
      exactMatches,
      matchedKeywords,
    }
  })

  const best = results
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      if (b.exactMatches !== a.exactMatches) return b.exactMatches - a.exactMatches
      return a.category.localeCompare(b.category)
    })
    .find((result) => result.score > 0)

  if (!best) {
    return {
      category: 'Shopping',
      score: 0,
      exactMatches: 0,
      matchedKeywords: [],
    }
  }

  return best
}
