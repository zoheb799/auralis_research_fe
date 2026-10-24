import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, BadgeDollarSign, BarChart3, TrendingUp } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { fetchStock, fetchStockAnalysis } from '../api/stocks'
import { formatApiError } from '../api/client'
import { PerformanceChart } from '../components/charts/PerformanceChart'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import type { Stock } from '../types/stock'

export function StockDetailsPage() {
  const { stockId } = useParams()
  const [stock, setStock] = useState<Stock | null>(null)
  const [analysis, setAnalysis] = useState<unknown>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [analysisError, setAnalysisError] = useState('')

  useEffect(() => {
    if (!stockId) {
      setError('A stock ID is required.')
      setLoading(false)
      return
    }

    let active = true
    setLoading(true)
    setError('')
    setAnalysisError('')
    setStock(null)
    setAnalysis(undefined)

    fetchStock(stockId)
      .then(({ data }) => {
        if (active) setStock(data)
      })
      .catch((requestError: unknown) => {
        if (active) setError(formatApiError(requestError))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    fetchStockAnalysis(stockId)
      .then(({ data }) => {
        if (active) setAnalysis(data)
      })
      .catch((requestError: unknown) => {
        if (active) setAnalysisError(formatApiError(requestError))
      })

    return () => {
      active = false
    }
  }, [stockId])

  if (loading) {
    return <p role="status" className="mx-auto max-w-7xl px-4 py-12 text-center text-sm text-slate-500">Loading stock...</p>
  }

  if (error || !stock) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error || 'Stock not found.'}
        </p>
        <Button variant="outline" asChild><Link to="/explore/stocks">Back to stocks</Link></Button>
      </div>
    )
  }

  const isPositive = stock.change >= 0

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
              <span className="rounded-full border border-slate-200 bg-white px-2 py-1">{stock.sector}</span>
            </div>
          </div>

          <div className="flex flex-col items-start gap-3 md:flex-row md:items-center">
            <div>
              <div className="text-3xl font-semibold text-slate-900">₹{stock.price.toLocaleString()}</div>
              <div className={`mt-1 inline-flex items-center gap-1 text-sm ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                <TrendingUp className="h-4 w-4" />
                {isPositive ? '+' : ''}{stock.change}%
              </div>
            </div>
            <Badge variant={isPositive ? 'success' : 'destructive'}>{stock.trend} trend</Badge>
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
            <Badge variant="outline">{stock.investmentHorizon}</Badge>
          </div>
          <PerformanceChart data={stock.chartData} />
        </Card>

        <Card className="border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 text-sm font-medium text-slate-500">Overview</div>
          <div className="space-y-4 text-sm text-slate-600">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
              <span>Market cap</span>
              <span className="font-medium text-slate-900">{stock.marketCap}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
              <span>Historical return</span>
              <span className="font-medium text-emerald-600">+{stock.historicalReturn}%</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
              <span>Research score</span>
              <span className="font-medium text-slate-900">{stock.score}/100</span>
            </div>
          </div>

          <Card className="mt-6 border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">API analysis</h2>
            {analysisError ? (
              <p role="alert" className="mt-3 text-sm text-red-700">{analysisError}</p>
            ) : analysis === undefined ? (
              <p role="status" className="mt-3 text-sm text-slate-500">Loading analysis...</p>
            ) : (
              <pre className="mt-4 overflow-x-auto whitespace-pre-wrap break-words rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
                {JSON.stringify(analysis, null, 2)}
              </pre>
            )}
          </Card>

          <p className="mt-5 text-sm leading-6 text-slate-600">{stock.description}</p>
        </Card>
      </div>

      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2 text-sm font-medium uppercase tracking-[0.12em] text-slate-500">
          <BadgeDollarSign className="h-4 w-4 text-sky-600" />
          Historical simulation
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-sm text-slate-500">Initial investment</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">₹{stock.initialInvestment.toLocaleString()}</div>
          </div>
          <div className="rounded-2xl bg-emerald-50 p-4">
            <div className="text-sm text-emerald-700">Historical value</div>
            <div className="mt-2 text-2xl font-semibold text-emerald-700">₹{stock.historicalValue.toLocaleString()}</div>
          </div>
          <div className="rounded-2xl bg-sky-50 p-4">
            <div className="text-sm text-sky-700">Historical gain</div>
            <div className="mt-2 text-2xl font-semibold text-sky-700">₹{stock.historicalGain.toLocaleString()}</div>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm leading-6 text-amber-900">
          Historical simulation based on historical performance. Past performance does not guarantee future results.
        </div>
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
