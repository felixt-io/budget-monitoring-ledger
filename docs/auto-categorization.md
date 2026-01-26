# Auto-Categorization

This app uses a simple, deterministic rules engine. It keeps the workflow fast and predictable while still letting you tune the system to your own habits.

## How it works

1. **Normalize the text**
   - Lowercase
   - Remove punctuation
   - Collapse extra spaces

2. **Compare against keyword rules**
   - Each category has a starter keyword list in `web/src/lib/categories.ts`.
   - Your custom keywords are stored in Supabase (`category_rules`).
   - The app merges the two sets every time you open the dashboard.

3. **Score each category**
   - Exact word match: `+3`
   - Partial match (substring): `+1`
   - Tie-breakers: higher exact matches, then category name (alphabetical)

4. **Pick the winner**
   - If no category scores above zero, the fallback is `Shopping`.

## Why this approach

- It is transparent: you can always see why something landed in a category.
- It is fast: no heavy dependencies, instant results.
- It is adjustable: you can add your own merchant names and local terms.

## Example

Input:

```
72 usd airport taxi 2026-01-21
```

Normalized tokens include `airport` and `taxi`, which match Transportation keywords.

## Tips for better matches

- Add your common merchants ("mtr", "octopus", "parknshop") as rules.
- Use short, clear item names when possible.
- Keep keywords in lowercase; the app normalizes everything anyway.
