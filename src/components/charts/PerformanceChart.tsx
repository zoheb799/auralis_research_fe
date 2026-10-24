import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import type { StockChartPoint } from '../../types/stock'

interface PerformanceChartProps {
  data: StockChartPoint[]
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="priceFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.32} />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
          <Tooltip
            formatter={(value) => {
              const numericValue = Array.isArray(value) ? Number(value[0] ?? 0) : Number(value ?? 0)
              return [`₹${numericValue.toLocaleString()}`, 'Performance']
            }}
            contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
          />
          <Area type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={3} fill="url(#priceFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
