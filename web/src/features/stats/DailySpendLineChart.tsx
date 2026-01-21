import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatHkd } from '../../lib/money'

type DailySpendLineChartProps = {
  data: { date: string; total: number }[]
}

export const DailySpendLineChart = ({ data }: DailySpendLineChartProps) => (
  <div className="chart-card">
    <h3>Daily spend</h3>
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ left: 12, right: 12, top: 8, bottom: 8 }}>
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={(value) => `${value / 1000}k`} />
        <Tooltip
          formatter={(value) =>
            formatHkd(typeof value === 'number' ? value : Number(value ?? 0))
          }
        />
        <Line type="monotone" dataKey="total" stroke="#3d5a80" strokeWidth={3} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  </div>
)
