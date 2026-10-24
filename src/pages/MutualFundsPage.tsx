import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Banknote, TrendingUp } from 'lucide-react'

import { fetchMutualFunds } from '../api/mutualFunds'
import { formatApiError } from '../api/client'
import { ExploreTabs } from '../components/explore/ExploreTabs'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { getListItems } from '../lib/apiResponse'
import type { MutualFund } from '../types/mutualFund'

export function MutualFundsPage() {
  const [funds, setFunds] = useState<MutualFund[]>([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    fetchMutualFunds({
      page,
      page_size: 20,
      search: search.trim() || undefined,
      category: category === 'all' ? undefined : category,
    })
      .then(({ data }) => {
        if (active) setFunds(getListItems(data))
      })
      .catch((requestError: unknown) => {
        if (active) setError(formatApiError(requestError))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [page, search, category])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
      <ExploreTabs />
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-sky-700">
          <Banknote className="h-4 w-4" />
          Portfolio building blocks
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">Explore Mutual Funds</h1>
      </div>

      <div className="mb-5 flex max-w-2xl flex-col gap-3 sm:flex-row">
        <Input
          aria-label="Search mutual funds"
          placeholder="Search mutual funds..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
        />
        <Select value={category} onValueChange={(value) => { setCategory(value); setPage(1) }}>
          <SelectTrigger className="sm:w-48"><SelectValue placeholder="Filter by category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            <SelectItem value="Equity">Equity</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {error && <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {loading ? <p role="status" className="py-8 text-center text-sm text-slate-500">Loading mutual funds...</p> : null}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {!loading && funds.map((fund) => (
          <Card key={fund.id} className="overflow-hidden border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <div className="text-xl font-semibold text-slate-900">{fund.name}</div>
                <div className="mt-1 text-sm text-slate-500">{fund.category}</div>
              </div>
              <Badge variant={fund.trend === 'Positive' ? 'success' : fund.trend === 'Neutral' ? 'default' : 'destructive'}>
                {fund.trend}
              </Badge>
            </div>

            <div className="mb-4 grid gap-3 text-sm text-slate-600">
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span>Indicative value</span>
                <span className="font-medium text-slate-900">
                  {typeof fund.indicativeValue === 'number' && Number.isFinite(fund.indicativeValue)
                    ? `₹${fund.indicativeValue.toLocaleString()}`
                    : 'Not available'}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span>Historical return</span>
                <span className="font-medium text-emerald-600">
                  {typeof fund.historicalReturn === 'number' && Number.isFinite(fund.historicalReturn)
                    ? `+${fund.historicalReturn}%`
                    : 'Not available'}
                </span>
              </div>
            </div>

            <p className="mb-4 text-sm leading-6 text-slate-600">{fund.summary}</p>

            <div className="flex items-center justify-between border-t border-slate-200 pt-4">
              <span className="inline-flex items-center gap-2 text-sm text-slate-500">
                <TrendingUp className="h-4 w-4 text-sky-600" />
                {fund.investmentHorizon}
              </span>
              <Button variant="ghost" size="sm" asChild>
                <Link to={`/mutual-funds/${fund.id}`} className="inline-flex items-center gap-1">
                  Details <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
      {!loading && funds.length === 0 && <p className="py-8 text-center text-sm text-slate-500">No mutual funds found.</p>}
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="outline" size="sm" disabled={page === 1 || loading} onClick={() => setPage((value) => value - 1)}>Previous</Button>
        <Button variant="outline" size="sm" disabled={loading || funds.length < 20} onClick={() => setPage((value) => value + 1)}>Next</Button>
      </div>
    </div>
  )
}
