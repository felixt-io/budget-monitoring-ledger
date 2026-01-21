import { formatHkd } from '../../lib/money'

type KpiRowProps = {
  total: number
  dailyAverage: number
  topCategory: string
  topCategorySpend: number
  largestExpenseLabel: string
  largestExpenseAmount: number
}

export const KpiRow = ({
  total,
  dailyAverage,
  topCategory,
  topCategorySpend,
  largestExpenseLabel,
  largestExpenseAmount,
}: KpiRowProps) => (
  <section className="kpi-grid">
    <div className="kpi-card">
      <span className="kpi-label">Total this month</span>
      <strong>{formatHkd(total)}</strong>
    </div>
    <div className="kpi-card">
      <span className="kpi-label">Daily average</span>
      <strong>{formatHkd(dailyAverage)}</strong>
    </div>
    <div className="kpi-card">
      <span className="kpi-label">Top category</span>
      <strong>{topCategory}</strong>
      <span className="kpi-sub">{formatHkd(topCategorySpend)}</span>
    </div>
    <div className="kpi-card">
      <span className="kpi-label">Largest expense</span>
      <strong>{formatHkd(largestExpenseAmount)}</strong>
      <span className="kpi-sub">{largestExpenseLabel}</span>
    </div>
  </section>
)
