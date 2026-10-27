import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, BarChart3, TrendingUp } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { fetchStock, fetchStockAnalysis } from '../api/stocks'
import { formatApiError } from '../api/client'
import { PerformanceChart } from '../components/charts/PerformanceChart'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import type { StockDetailResponse } from '../types/stock'

interface StockPageState {
  stockId: string
  stock?: StockDetailResponse
  analysis?: unknown
  loading: boolean
  analysisLoading: boolean
  error: string
  analysisError: string
}

export function StockDetailsPage() {
  const { stockId } = useParams()
  const [pageState, setPageState] = useState<StockPageState>({
    stockId: '',
    loading: true,
    analysisLoading: true,
    error: '',
    analysisError: '',
  })

  useEffect(() => {
    if (!stockId) return

    let active = true
    const updatePageState = (patch: Partial<StockPageState>) => {
      setPageState((previous) => ({
        ...(previous.stockId === stockId ? previous : {
          stockId,
          loading: true,
          analysisLoading: true,
          error: '',
          analysisError: '',
        }),
        ...patch,
      }))
    }

    fetchStock(stockId)
      .then(({ data }) => {
        if (active) updatePageState({ stock: data })
      })
      .catch((requestError: unknown) => {
        if (active) updatePageState({ error: formatApiError(requestError) })
      })
      .finally(() => {
        if (active) updatePageState({ loading: false })
      })

    fetchStockAnalysis(stockId)
      .then(({ data }) => {
        if (active) updatePageState({ analysis: data })
      })
      .catch((requestError: unknown) => {
        if (active) updatePageState({ analysisError: formatApiError(requestError) })
      })
      .finally(() => {
        if (active) updatePageState({ analysisLoading: false })
      })

    return () => {
      active = false
    }
  }, [stockId])

  if (!stockId) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          A stock ID is required.
        </p>
        <Button variant="outline" asChild><Link to="/explore/stocks">Back to stocks</Link></Button>
      </div>
    )
  }

  const currentState = stockId && pageState.stockId === stockId ? pageState : undefined

  if (!currentState || currentState.loading) {
    return <p role="status" className="mx-auto max-w-7xl px-4 py-12 text-center text-sm text-slate-500">Loading stock...</p>
  }

  if (currentState.error || !currentState.stock) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {currentState.error || 'Stock not found.'}
        </p>
        <Button variant="outline" asChild><Link to="/explore/stocks">Back to stocks</Link></Button>
      </div>
    )
  }

  const { stock, analysis, analysisError } = currentState
  const isPositive = stock.change_percent >= 0
  const chartData = [...stock.price_history]
    .sort((a, b) => a.price_timestamp.localeCompare(b.price_timestamp))
    .map((point) => ({
      month: new Date(point.price_timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      value: point.close,
    }))
  const fundamentals = [
    ['Market cap', stock.fundamentals.market_cap],
    ['P/E ratio', stock.fundamentals.pe_ratio],
    ['EPS', stock.fundamentals.eps],
    ['Dividend yield', stock.fundamentals.dividend_yield, '%'],
    ['Book value', stock.fundamentals.book_value],
    ['Debt to equity', stock.fundamentals.debt_to_equity],
    ['ROE', stock.fundamentals.roe, '%'],
  ] as const

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-3xl border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-slate-50 p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-sky-700">
              <BarChart3 className="h-4 w-4" />
              Stock analysis
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">{stock.name}</h1>
            <div className="mt-2 flex items-center gap-3 text-sm text-slate-500">
              <span className="font-medium uppercase tracking-[0.08em] text-slate-700">{stock.symbol}</span>
              <span className="rounded-full border border-slate-200 bg-white px-2 py-1">{stock.sector || 'Sector unavailable'}</span>
              <span>{stock.exchange}</span>
            </div>
          </div>

          <div className="flex flex-col items-start gap-3 md:flex-row md:items-center">
            <div>
              <div className="text-3xl font-semibold text-slate-900">₹{stock.price.toLocaleString()}</div>
              <div className={`mt-1 inline-flex items-center gap-1 text-sm ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                <TrendingUp className="h-4 w-4" />
                {isPositive ? '+' : ''}{stock.change_percent}%
              </div>
            </div>
            <Badge variant="outline">{stock.price_data_type} · {stock.price_interval}</Badge>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <Card className="border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-slate-500">Historical performance</div>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">Performance overview</h2>
            </div>
            <Badge variant="outline">{stock.price_history.length} data points</Badge>
          </div>
          {chartData.length ? (
            <PerformanceChart data={chartData} />
          ) : (
            <p className="py-12 text-center text-sm text-slate-500">No price history available.</p>
          )}
        </Card>

        <Card className="border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 text-sm font-medium text-slate-500">Overview</div>
          <div className="space-y-3 text-sm text-slate-600">
            {fundamentals.map(([label, value, suffix]) => (
              <div key={label} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                <span>{label}</span>
                <span className="font-medium text-slate-900">
                  {value == null ? 'N/A' : `${value.toLocaleString()}${suffix ?? ''}`}
                </span>
              </div>
            ))}
          </div>

          <Card className="mt-6 border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">API analysis</h2>
            {analysisError ? (
              <p role="alert" className="mt-3 text-sm text-red-700">{analysisError}</p>
            ) : currentState.analysisLoading ? (
              <p role="status" className="mt-3 text-sm text-slate-500">Loading analysis...</p>
            ) : (
              <pre className="mt-4 overflow-x-auto whitespace-pre-wrap break-words rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
                {JSON.stringify(analysis, null, 2)}
              </pre>
            )}
          </Card>

        </Card>
      </div>

      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-xl font-semibold text-slate-900">Financial history</h2>
        {stock.financial_history.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-3 py-3 font-medium">Period ending</th>
                  <th className="px-3 py-3 font-medium">Revenue</th>
                  <th className="px-3 py-3 font-medium">Operating profit</th>
                  <th className="px-3 py-3 font-medium">Net profit</th>
                  <th className="px-3 py-3 font-medium">EPS</th>
                </tr>
              </thead>
              <tbody>
                {stock.financial_history.map((period) => (
                  <tr key={`${period.period_type}-${period.period_end}`} className="border-b border-slate-100 last:border-0">
                    <td className="px-3 py-3 text-slate-700">{period.period_end}</td>
                    <td className="px-3 py-3 text-slate-700">{period.revenue?.toLocaleString() ?? 'N/A'}</td>
                    <td className="px-3 py-3 text-slate-700">{period.operating_profit?.toLocaleString() ?? 'N/A'}</td>
                    <td className="px-3 py-3 text-slate-700">{period.net_profit?.toLocaleString() ?? 'N/A'}</td>
                    <td className="px-3 py-3 text-slate-700">{period.eps?.toLocaleString() ?? 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-500">No financial history available.</p>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        <Button variant="outline" asChild>
          <Link to="/explore/stocks">Back to explore</Link>
        </Button>
        <Button className="gap-2">
          View research brief
          <ArrowUpRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
