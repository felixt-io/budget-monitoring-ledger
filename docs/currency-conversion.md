# Currency Conversion

The app stores every transaction in its original currency and also converts it to HKD. This keeps monthly views consistent while still preserving the real amount you paid.

## Rate source

Rates are fetched from the Frankfurter API:

```
https://api.frankfurter.app/
```

## Caching and offline use

- Rates are cached in `localStorage` for quick reuse.
- If you are offline, the app will use a cached rate for that date (if available).
- This makes travel-friendly entry possible even without stable internet.

## Date lookback

Markets close on weekends and holidays. The app will try up to 7 days back from the chosen date to find the closest available rate.

## What gets stored per entry

- `original_amount`
- `original_currency`
- `hkd_amount`
- `fx_rate`
- `fx_date`

This keeps the ledger auditable and lets you see exactly which rate was applied.
