import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarRange, CircleDashed, Sparkles } from 'lucide-react'

import { fetchIPOs } from '../api/ipos'
import { formatApiError } from '../api/client'
import { ExploreTabs } from '../components/explore/ExploreTabs'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { getListItems } from '../lib/apiResponse'
import type { IPO } from '../types/ipo'

export function IPOPage() {
  const [ipos, setIpos] = useState<IPO[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    fetchIPOs({ page, page_size: 20, search: search.trim() || undefined, status: status === 'all' ? undefined : status })
      .then(({ data }) => {
        if (active) setIpos(getListItems(data))
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
  }, [page, search, status])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
      <ExploreTabs />
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-sky-700">
          <Sparkles className="h-4 w-4" />
          New listings
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">Explore IPOs</h1>
      </div>

      <div className="mb-5 flex max-w-2xl flex-col gap-3 sm:flex-row">
        <Input
          aria-label="Search IPOs"
          placeholder="Search IPOs..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
        />
        <Select value={status} onValueChange={(value) => { setStatus(value); setPage(1) }}>
          <SelectTrigger className="sm:w-48"><SelectValue placeholder="Filter by status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="listed">Listed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {error && <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {loading ? <p role="status" className="py-8 text-center text-sm text-slate-500">Loading IPOs...</p> : null}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {!loading && ipos.map((ipo) => (
          <Card key={ipo.id} className="overflow-hidden border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <div className="text-xl font-semibold text-slate-900">{ipo.name}</div>
                <div className="mt-1 text-sm text-slate-500">{ipo.company}</div>
              </div>
              <Badge
                variant={
                  ipo.status === 'Listed' ? 'success' : ipo.status === 'Oversubscribed' ? 'warning' : 'default'
                }
              >
                {ipo.status}
              </Badge>
            </div>

            <div className="mb-4 grid gap-3 text-sm text-slate-600">
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span>Price range</span>
                <span className="font-medium text-slate-900">{ipo.priceRange}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span>Issue size</span>
                <span className="font-medium text-slate-900">{ipo.issueSize}</span>
              </div>
            </div>

            <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
              <CalendarRange className="h-4 w-4 text-sky-600" />
              {ipo.launchDate} to {ipo.closeDate}
            </div>

            <p className="mb-4 text-sm leading-6 text-slate-600">{ipo.summary}</p>

            <div className="flex items-center justify-between border-t border-slate-200 pt-4">
              <span className="inline-flex items-center gap-2 text-sm text-slate-500">
                <CircleDashed className="h-4 w-4 text-sky-600" />
                Market watch
              </span>
              <Button variant="ghost" size="sm" asChild><Link to={`/ipos/${ipo.id}`}>Details</Link></Button>
            </div>
          </Card>
        ))}
      </div>
      {!loading && ipos.length === 0 && <p className="py-8 text-center text-sm text-slate-500">No IPOs found.</p>}
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="outline" size="sm" disabled={page === 1 || loading} onClick={() => setPage((value) => value - 1)}>Previous</Button>
        <Button variant="outline" size="sm" disabled={loading || ipos.length < 20} onClick={() => setPage((value) => value + 1)}>Next</Button>
      </div>
    </div>
  )
}
