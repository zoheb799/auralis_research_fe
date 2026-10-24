import { motion } from 'framer-motion'
import { ArrowUpRight, Building2, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'

import type { Stock } from '../../types/stock'

interface StockCardProps {
  stock: Stock
}

export function StockCard({ stock }: StockCardProps) {
  const isPositive = stock.change >= 0

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Link
        to={`/stocks/${stock.id}`}
        className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-sky-200 hover:shadow-[0_18px_30px_rgba(14,116,144,0.08)]"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <div className="text-lg font-semibold text-slate-900">{stock.name}</div>
            <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
              <span className="font-medium uppercase tracking-[0.08em] text-slate-600">{stock.symbol}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                <Building2 className="h-3 w-3" />
                {stock.sector}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-semibold text-slate-900">₹{stock.price.toLocaleString()}</div>
            <div className={`mt-1 inline-flex items-center gap-1 text-sm ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
              <TrendingUp className="h-3.5 w-3.5" />
              {isPositive ? '+' : ''}{stock.change}%
            </div>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-2 text-xs font-medium text-slate-600">
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-emerald-700">
            {stock.investmentHorizon}
          </span>
          <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-1 text-sky-700">
            {stock.historicalReturn}% historical return
          </span>
        </div>

        <p className="mb-5 text-sm leading-6 text-slate-600">{stock.summary}</p>

        <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-sm">
          <span className="text-slate-500">Research score</span>
          <span className="font-semibold text-slate-900">{stock.score}/100</span>
        </div>

        <div className="mt-4 flex items-center justify-end text-sm font-medium text-sky-700 group-hover:text-sky-800">
          View details
          <ArrowUpRight className="ml-1 h-4 w-4" />
        </div>
      </Link>
    </motion.div>
  )
}
