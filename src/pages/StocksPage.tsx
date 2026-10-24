import { useEffect, useState } from 'react'
import { BriefcaseBusiness, Filter, SlidersHorizontal } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'

import { fetchStocks } from '../api/stocks'
import { formatApiError } from '../api/client'
import { StockCard } from '../components/stocks/StockCard'
import { ExploreTabs } from '../components/explore/ExploreTabs'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs'
import { getListItems } from '../lib/apiResponse'
import type { InvestmentHorizon, Stock } from '../types/stock'

export function StocksPage() {
  const [searchParams] = useSearchParams()
  const [sortBy, setSortBy] = useState('name-asc')
  const [horizon, setHorizon] = useState<InvestmentHorizon | 'All'>('All')
  const [search, setSearch] = useState(searchParams.get('query') ?? '')
  const [page, setPage] = useState(1)
  const [stocks, setStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const query = searchParams.get('query')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')

    fetchStocks({
      page,
      page_size: 20,
      search: search.trim() || undefined,
      sort: 'name',
      order: sortBy === 'name-desc' ? 'desc' : 'asc',
    })
      .then(({ data }) => {
        if (active) setStocks(getListItems(data))
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
  }, [page, search, sortBy])

  const filteredStocks = horizon === 'All'
    ? stocks
    : stocks.filter((stock) => stock.investmentHorizon === horizon)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
      <ExploreTabs />
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-sky-700">
            <BriefcaseBusiness className="h-4 w-4" />
            Investment universe
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">Explore Stocks</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">
            Explore stocks based on historical performance, risk-aware positioning, and investment horizon.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      <div className="mb-5 max-w-md">
        <Input
          aria-label="Search stocks"
          placeholder="Search stocks..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
        />
      </div>

      {query && (
        <Card className="mb-6 border-sky-200 bg-sky-50/70 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.12em] text-sky-700">Research query</div>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">{query}</h2>
            </div>
            <Badge variant="default">AI recommendation style</Badge>
          </div>
        </Card>
      )}

      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
          <SlidersHorizontal className="h-4 w-4 text-sky-600" />
          Sort by
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="w-full md:w-56">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="name-asc">Name: A to Z</SelectItem>
                  <SelectItem value="name-desc">Name: Z to A</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs value={horizon} onValueChange={(value) => setHorizon(value as InvestmentHorizon | 'All')} className="w-full md:w-auto">
            <TabsList>
              <TabsTrigger value="All">All</TabsTrigger>
              <TabsTrigger value="Short Term">Short Term</TabsTrigger>
              <TabsTrigger value="Long Term">Long Term</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="mb-6 text-sm text-slate-600">
        {filteredStocks.length} stocks on this page
      </div>

      {error && <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {loading ? (
        <p role="status" className="py-8 text-center text-sm text-slate-500">Loading stocks...</p>
      ) : filteredStocks.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">No stocks found.</p>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {filteredStocks.map((stock) => (
            <StockCard key={stock.id} stock={stock} />
          ))}
        </div>
      )}
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="outline" size="sm" disabled={page === 1 || loading} onClick={() => setPage((value) => value - 1)}>
          Previous
        </Button>
        <Button variant="outline" size="sm" disabled={loading || stocks.length < 20} onClick={() => setPage((value) => value + 1)}>
          Next
        </Button>
      </div>
    </div>
  )
}
