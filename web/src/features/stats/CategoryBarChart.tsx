import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatHkd } from '../../lib/money'

type CategoryBarChartProps = {
  data: { category: string; total: number }[]
}

export const CategoryBarChart = ({ data }: CategoryBarChartProps) => (
  <div className="chart-card">
    <h3>Category totals</h3>
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ left: 12, right: 12, top: 8, bottom: 8 }}>
        <XAxis dataKey="category" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" />
        <YAxis tickFormatter={(value) => `${value / 1000}k`} />
        <Tooltip
          formatter={(value) =>
            formatHkd(typeof value === 'number' ? value : Number(value ?? 0))
          }
        />
        <Bar dataKey="total" fill="#f08a5d" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
)
