import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { fetchIPO, fetchIPOAnalysis } from '../api/ipos'
import { fetchMutualFund, fetchMutualFundAnalysis } from '../api/mutualFunds'
import { formatApiError } from '../api/client'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'

interface AssetDetailsPageProps {
  assetType: 'ipo' | 'mutual-fund'
}

export function AssetDetailsPage({ assetType }: AssetDetailsPageProps) {
  const { assetId } = useParams()
  const [asset, setAsset] = useState<unknown>()
  const [analysis, setAnalysis] = useState<unknown>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [analysisError, setAnalysisError] = useState('')
  const listPath = assetType === 'ipo' ? '/explore/ipos' : '/explore/mutual-funds'
  const title = assetType === 'ipo' ? 'IPO' : 'Mutual fund'

  useEffect(() => {
    if (!assetId) {
      setError(`A ${title.toLowerCase()} ID is required.`)
      setLoading(false)
      return
    }

    let active = true
    setLoading(true)
    setError('')
    setAnalysisError('')
    setAsset(undefined)
    setAnalysis(undefined)

    const assetRequest = assetType === 'ipo' ? fetchIPO(assetId) : fetchMutualFund(assetId)
    const analysisRequest = assetType === 'ipo' ? fetchIPOAnalysis(assetId) : fetchMutualFundAnalysis(assetId)

    assetRequest
      .then(({ data }) => {
        if (active) setAsset(data)
      })
      .catch((requestError: unknown) => {
        if (active) setError(formatApiError(requestError))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    analysisRequest
      .then(({ data }) => {
        if (active) setAnalysis(data)
      })
      .catch((requestError: unknown) => {
        if (active) setAnalysisError(formatApiError(requestError))
      })

    return () => {
      active = false
    }
  }, [assetId, assetType, title])

  if (loading) {
    return <p role="status" className="mx-auto max-w-7xl px-4 py-12 text-center text-sm text-slate-500">Loading {title.toLowerCase()}...</p>
  }

  if (error || asset === undefined) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error || `${title} not found.`}</p>
        <Button variant="outline" asChild><Link to={listPath}>Back to {title.toLowerCase()}s</Link></Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
      <div className="mb-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-sky-700">{title} details</p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">{title} research</h1>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-xl font-semibold text-slate-900">Details</h2>
          <pre className="mt-4 overflow-x-auto whitespace-pre-wrap break-words rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
            {JSON.stringify(asset, null, 2)}
          </pre>
        </Card>
        <Card className="p-5">
          <h2 className="text-xl font-semibold text-slate-900">Analysis</h2>
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
      </div>
      <div className="mt-6">
        <Button variant="outline" asChild><Link to={listPath}>Back to {title.toLowerCase()}s</Link></Button>
      </div>
    </div>
  )
}
