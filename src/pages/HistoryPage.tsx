import { format } from 'date-fns'
import { History, MessageSquareText } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { conversationsApi } from '../api/conversations'
import { formatApiError } from '../api/client'
import { Card } from '../components/ui/card'
import type { Conversation } from '../types/api'

const getConversationTitle = (conversation: Conversation) => {
  const title = conversation.title?.trim()
  return title || 'Untitled conversation'
}

export function HistoryPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    conversationsApi.list()
      .then(({ data }) => {
        if (active) setConversations(data)
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
  }, [])

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 lg:px-8">
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-sky-700">
          <History className="h-4 w-4" />
          Conversation history
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">History</h1>
      </div>

      {error ? (
        <div role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>
      ) : null}

      {loading ? (
        <div role="status" className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">Loading conversations...</div>
      ) : conversations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
          No conversations yet.
        </div>
      ) : (
        <div className="space-y-4">
          {conversations.map((conversation) => (
            <Link key={conversation.id} to={`/conversation/${conversation.id}`} className="block">
              <Card className="group border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-[0_18px_30px_rgba(14,116,144,0.08)]">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-xl font-semibold text-slate-900">{getConversationTitle(conversation)}</div>
                    <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                      <span>
                        {conversation.updated_at
                          ? format(new Date(conversation.updated_at), 'MMM d, yyyy • h:mm a')
                          : conversation.created_at
                            ? format(new Date(conversation.created_at), 'MMM d, yyyy')
                            : 'Recent'}
                      </span>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                    <MessageSquareText className="h-3.5 w-3.5 text-sky-600" />
                    Open conversation
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
