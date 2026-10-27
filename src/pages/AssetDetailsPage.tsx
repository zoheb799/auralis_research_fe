import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight, Building2, CalendarDays, CircleDollarSign, ShieldCheck, Sparkles } from 'lucide-react'

import { fetchIPO, fetchIPOAnalysis } from '../api/ipos'
import { fetchMutualFund, fetchMutualFundAnalysis } from '../api/mutualFunds'
import { formatApiError } from '../api/client'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import type { IPOAnalysis, IPOResponse } from '../types/ipo'
import type { MutualFundAnalysis, MutualFundResponse } from '../types/mutualFund'

interface AssetDetailsPageProps {
  assetType: 'ipo' | 'mutual-fund'
}

type Asset = IPOResponse | MutualFundResponse
type Analysis = IPOAnalysis | MutualFundAnalysis
type MetricValue = number | string | null
interface AssetPageState {
  assetId: string
  asset?: Asset
  analysis?: Analysis
  loading: boolean
  analysisLoading: boolean
  error: string
  analysisError: string
}

function displayNumber(value: number | null, suffix = '') {
  return value == null ? 'Not available' : `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}${suffix}`
}

function displayDate(value: string | null) {
  if (!value) return 'Not announced'
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

function signalVariant(signal: string): 'success' | 'warning' | 'destructive' | 'outline' {
  const normalized = signal.toLowerCase()
  if (['good', 'strong', 'positive', 'low'].includes(normalized)) return 'success'
  if (['moderate', 'medium', 'mixed', 'average'].includes(normalized)) return 'warning'
  if (['high', 'weak', 'negative', 'poor'].includes(normalized)) return 'destructive'
  return 'outline'
}

function signalLabel(signal: string) {
  return signal === 'unknown' ? 'Awaiting data' : signal.replaceAll('_', ' ')
}

function MetricTile({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <Card className="h-full border-slate-200/80 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 break-words text-xl font-semibold leading-tight text-slate-900">{value}</p>
      {note && <p className="mt-1 text-xs leading-5 text-slate-500">{note}</p>}
    </Card>
  )
}

function AnalysisCard({
  title,
  signal,
  metrics,
}: {
  title: string
  signal: string
  metrics: Array<{ label: string; value: MetricValue; suffix?: string }>
}) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-semibold text-slate-900">{title}</h3>
        <Badge variant={signalVariant(signal)}>{signalLabel(signal)}</Badge>
      </div>
      <dl className="space-y-3">
        {metrics.map(({ label, value, suffix = '' }) => (
          <div key={label} className="flex items-center justify-between gap-4 border-t border-slate-100 pt-3 text-sm first:border-0 first:pt-0">
            <dt className="text-slate-500">{label}</dt>
            <dd className="text-right font-medium text-slate-800">
              {typeof value === 'number'
                ? displayNumber(value, suffix)
                : value == null || value.toLowerCase() === 'unknown'
                  ? 'Not available'
                  : value.replaceAll('_', ' ')}
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  )
}

function DataNotice({ error, loading }: { error: string; loading: boolean }) {
  if (error) return <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>
  if (loading) return <p role="status" className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">Loading research analysis...</p>
  return null
}

function IPOContent({ asset, analysis, analysisError, analysisLoading }: {
  asset: IPOResponse
  analysis?: IPOAnalysis
  analysisError: string
  analysisLoading: boolean
}) {
  const priceRange = asset.issue_price_low != null && asset.issue_price_high != null
    ? `₹${asset.issue_price_low.toLocaleString()} – ₹${asset.issue_price_high.toLocaleString()}`
    : 'Not announced'
  const lotInvestment = asset.issue_price_high != null && asset.lot_size != null
    ? `₹${(asset.issue_price_high * asset.lot_size).toLocaleString()}`
    : 'Not available'

  return (
    <>
      <section className="relative overflow-hidden rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-5 shadow-sm sm:p-8 lg:p-9">
        <div className="pointer-events-none absolute -right-12 -top-20 h-72 w-72 rounded-full bg-sky-200/50 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-sky-200 bg-white/80 text-sky-800">IPO overview</Badge>
              <Badge variant={asset.ipo_status.toLowerCase() === 'listed' ? 'success' : 'default'}>{asset.ipo_status}</Badge>
              {asset.exchange && <Badge variant="outline">{asset.exchange}</Badge>}
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{asset.name}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              {asset.description || 'Review the issue details, key dates, and available company signals before making an investment decision.'}
            </p>
            {(asset.symbol || asset.sector) && (
              <div className="mt-5 flex flex-wrap gap-2 text-sm text-slate-700">
                {asset.symbol && <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1">{asset.symbol}</span>}
                {asset.sector && <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1">{asset.sector}</span>}
              </div>
            )}
          </div>
          <div className="w-full rounded-2xl border border-sky-100 bg-white p-5 shadow-sm lg:max-w-xs lg:p-6">
            <p className="text-sm font-medium text-slate-500">Price band</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{priceRange}</p>
            <div className="mt-4 border-t border-slate-100 pt-3">
              <p className="text-xs text-slate-500">Estimated maximum for one lot</p>
              <p className="mt-1 font-semibold text-sky-800">{lotInvestment}</p>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="IPO key details" className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Issue size" value={displayNumber(asset.issue_size, asset.issue_size == null ? '' : ' Cr')} note="₹ crore, as reported by the data source" />
        <MetricTile label="Lot size" value={asset.lot_size == null ? 'Not available' : `${asset.lot_size} shares`} />
        <MetricTile label="Opens" value={displayDate(asset.open_date)} />
        <MetricTile label="Closes" value={displayDate(asset.close_date)} />
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-700">Company assessment</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-900">IPO analysis</h2>
          </div>
          <Sparkles className="hidden h-6 w-6 text-sky-600 sm:block" />
        </div>
        <DataNotice error={analysisError} loading={analysisLoading} />
        {analysis && (
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <AnalysisCard title="Growth" signal={analysis.growth.signal} metrics={[
              { label: 'Revenue growth', value: analysis.growth.revenue_growth, suffix: '%' },
              { label: 'Profit growth', value: analysis.growth.profit_growth, suffix: '%' },
            ]} />
            <AnalysisCard title="Profitability" signal={analysis.profitability.signal} metrics={[
              { label: 'ROE', value: analysis.profitability.roe, suffix: '%' },
              { label: 'ROCE', value: analysis.profitability.roce, suffix: '%' },
              { label: 'Operating margin', value: analysis.profitability.operating_margin, suffix: '%' },
              { label: 'Net margin', value: analysis.profitability.net_margin, suffix: '%' },
            ]} />
            <AnalysisCard title="Valuation" signal={analysis.valuation.signal} metrics={[
              { label: 'P/E ratio', value: analysis.valuation.pe_ratio },
            ]} />
            <AnalysisCard title="Risk view" signal={analysis.risk.signal} metrics={[
              { label: 'Debt', value: analysis.risk.debt },
              { label: 'Profitability', value: analysis.risk.profitability },
              { label: 'Valuation', value: analysis.risk.valuation },
              { label: 'Offer for sale', value: analysis.risk.ofs_percentage, suffix: '%' },
            ]} />
          </div>
        )}
      </section>

      {analysis && (
        <Card className="mt-5 p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <CircleDollarSign className="h-5 w-5 text-sky-600" />
            <h2 className="text-lg font-semibold text-slate-900">Issue structure</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Fresh issue', analysis.issue_structure.fresh_issue_size],
              ['Offer for sale', analysis.issue_structure.ofs_size],
              ['OFS share', analysis.issue_structure.ofs_percentage == null ? null : `${analysis.issue_structure.ofs_percentage}%`],
              ['Listing date', displayDate(asset.listing_date)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-1 font-semibold text-slate-900">{typeof value === 'number' ? displayNumber(value) : value ?? 'Not available'}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Disclosure source={asset.source_attribution} text={asset.source_disclaimer} />
    </>
  )
}

function MutualFundContent({ asset, analysis, analysisError, analysisLoading }: {
  asset: MutualFundResponse
  analysis?: MutualFundAnalysis
  analysisError: string
  analysisLoading: boolean
}) {
  return (
    <>
      <section className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-sky-50 p-5 shadow-sm sm:p-8 lg:p-9">
        <div className="pointer-events-none absolute -right-12 -top-20 h-72 w-72 rounded-full bg-indigo-200/50 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-indigo-200 bg-white/80 text-indigo-800">Mutual fund</Badge>
              {asset.category && <Badge variant="default">{asset.category}</Badge>}
              {asset.symbol && <Badge variant="outline">Code {asset.symbol}</Badge>}
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{asset.name}</h1>
            <p className="mt-3 flex items-center gap-2 text-sm text-slate-600">
              <Building2 className="h-4 w-4 text-indigo-600" />
              {asset.fund_house || 'Fund house not available'}
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              {asset.description || 'Explore the fund profile and available performance, cost, and risk indicators.'}
            </p>
          </div>
          <div className="w-full rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm lg:max-w-xs lg:p-6">
            <p className="text-sm font-medium text-slate-500">Latest NAV</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              {asset.nav == null ? 'Not available' : `₹${asset.nav.toLocaleString(undefined, { maximumFractionDigits: 3 })}`}
            </p>
            <p className="mt-2 text-xs text-slate-500">NAV date not provided</p>
          </div>
        </div>
      </section>

      <section aria-label="Fund details" className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Category" value={asset.category || 'Not available'} />
        <MetricTile label="Assets under management" value={displayNumber(asset.aum)} />
        <MetricTile label="Expense ratio" value={displayNumber(asset.expense_ratio, asset.expense_ratio == null ? '' : '%')} />
        <MetricTile label="Risk level" value={asset.risk_level || 'Not rated'} />
      </section>

      <section className="mt-8">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-700">Fund assessment</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900">Performance & risk analysis</h2>
        </div>
        <DataNotice error={analysisError} loading={analysisLoading} />
        {analysis && (
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <AnalysisCard title="Returns" signal={analysis.returns.signal} metrics={[
              { label: '1-year', value: analysis.returns.return_1y, suffix: '%' },
              { label: '3-year', value: analysis.returns.return_3y, suffix: '%' },
              { label: '5-year', value: analysis.returns.return_5y, suffix: '%' },
            ]} />
            <AnalysisCard title="Benchmark (1Y)" signal={analysis.benchmark.signal} metrics={[
              { label: 'Fund return', value: analysis.benchmark.fund_return_1y, suffix: '%' },
              { label: 'Benchmark return', value: analysis.benchmark.benchmark_return_1y, suffix: '%' },
            ]} />
            <AnalysisCard title="Risk & efficiency" signal={analysis.risk.signal} metrics={[
              { label: 'Volatility', value: analysis.volatility.volatility, suffix: '%' },
              { label: 'Sharpe ratio', value: analysis.sharpe.sharpe_ratio },
              { label: 'Top 10 holdings', value: analysis.concentration.top_10_percentage, suffix: '%' },
            ]} />
            <AnalysisCard title="Consistency" signal={analysis.consistency.signal} metrics={[
              { label: 'Positive periods', value: analysis.consistency.positive_periods },
              { label: 'Periods measured', value: analysis.consistency.total_periods },
              { label: 'Expense ratio', value: analysis.expense_ratio.expense_ratio, suffix: '%' },
            ]} />
          </div>
        )}
      </section>

      <div className="mt-5 flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-sm leading-6 text-indigo-950">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-indigo-700" />
        <p>Returns and risk indicators are shown only when supplied by the data source. Past performance does not guarantee future results.</p>
      </div>
    </>
  )
}

function Disclosure({ source, text }: { source: string | null; text: string | null }) {
  if (!source && !text) return null
  return (
    <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
      {source && <p className="font-medium">{source}</p>}
      {text && <p className={source ? 'mt-1' : ''}>{text}</p>}
    </div>
  )
}

export function AssetDetailsPage({ assetType }: AssetDetailsPageProps) {
  const { assetId } = useParams()
  const [pageState, setPageState] = useState<AssetPageState>({
    assetId: '',
    loading: true,
    analysisLoading: true,
    error: '',
    analysisError: '',
  })
  const listPath = assetType === 'ipo' ? '/explore/ipos' : '/explore/mutual-funds'
  const title = assetType === 'ipo' ? 'IPO' : 'Mutual fund'

  useEffect(() => {
    if (!assetId) return

    let active = true
    const updatePageState = (patch: Partial<AssetPageState>) => {
      setPageState((previous) => ({
        ...(previous.assetId === assetId ? previous : {
          assetId,
          loading: true,
          analysisLoading: true,
          error: '',
          analysisError: '',
        }),
        ...patch,
      }))
    }

    const assetRequest = assetType === 'ipo' ? fetchIPO(assetId) : fetchMutualFund(assetId)
    const analysisRequest = assetType === 'ipo' ? fetchIPOAnalysis(assetId) : fetchMutualFundAnalysis(assetId)

    assetRequest
      .then(({ data }) => { if (active) updatePageState({ asset: data }) })
      .catch((requestError: unknown) => { if (active) updatePageState({ error: formatApiError(requestError) }) })
      .finally(() => { if (active) updatePageState({ loading: false }) })

    analysisRequest
      .then(({ data }) => { if (active) updatePageState({ analysis: data }) })
      .catch((requestError: unknown) => { if (active) updatePageState({ analysisError: formatApiError(requestError) }) })
      .finally(() => { if (active) updatePageState({ analysisLoading: false }) })

    return () => { active = false }
  }, [assetId, assetType])

  const currentState = assetId && pageState.assetId === assetId ? pageState : undefined

  if (!assetId || currentState?.error || (!currentState?.loading && !currentState?.asset)) {
    const message = !assetId
      ? `A ${title.toLowerCase()} ID is required.`
      : currentState?.error || `${title} not found.`
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{message}</p>
        <Button variant="outline" asChild><Link to={listPath}>Back to {title.toLowerCase()}s</Link></Button>
      </div>
    )
  }

  if (!currentState || currentState.loading) {
    return <p role="status" className="mx-auto max-w-7xl px-4 py-12 text-center text-sm text-slate-500">Loading {title.toLowerCase()}...</p>
  }

  const { asset, analysis, analysisError, analysisLoading } = currentState

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
      <div className="mb-5 flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link to={listPath}><ArrowLeft className="h-4 w-4" />Back to {title.toLowerCase()}s</Link>
        </Button>
        <span className="hidden items-center gap-1.5 text-xs text-slate-500 sm:inline-flex">
          <CalendarDays className="h-3.5 w-3.5" />Data supplied by market sources
        </span>
      </div>
      {asset && 'ipo_status' in asset ? (
        <IPOContent
          asset={asset}
          analysis={analysis && 'growth' in analysis ? analysis : undefined}
          analysisError={analysisError}
          analysisLoading={analysisLoading}
        />
      ) : asset ? (
        <MutualFundContent
          asset={asset}
          analysis={analysis && 'returns' in analysis ? analysis : undefined}
          analysisError={analysisError}
          analysisLoading={analysisLoading}
        />
      ) : null}
      <div className="mt-8 flex justify-end">
        <Button variant="outline" asChild><Link to={listPath}>Explore more {title.toLowerCase()}s <ArrowUpRight className="h-4 w-4" /></Link></Button>
      </div>
    </div>
  )
}
