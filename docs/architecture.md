# Architecture

The app is a single-page web app built with React + Vite and backed by Supabase.

## Main flow

1. **Quick entry**
   - User pastes a single line or fills the form.
   - `web/src/lib/smartText.ts` parses amount, currency, date, and item.

2. **Auto-category**
   - `web/src/lib/categorize.ts` scores the item text against keyword rules.

3. **FX conversion**
   - `web/src/lib/fx.ts` converts to HKD and caches the rate.

4. **Persist**
   - Data is inserted into Supabase (`transactions`).

5. **Insights**
   - Aggregations render charts and KPIs from stored HKD values.

## Why this shape

- The UI stays fast because categorization and conversion are client-side.
- Data stays portable because transactions are normalized and exportable.
- The workflow is designed for daily capture, not heavy configuration.
