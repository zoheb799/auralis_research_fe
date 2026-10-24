import { format, isValid } from 'date-fns'
import { History, MessageSquareText, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

import { conversationsApi } from '../../api/conversations'
import { formatApiError } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import type { Conversation } from '../../types/api'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { ChatWidget } from './ChatWidget'

const getConversationTitle = (conversation: Conversation) => {
  const title = conversation.title?.trim()
  return title || 'Untitled conversation'
}

const getConversationDate = (conversation: Conversation) => {
  const value = conversation.updated_at ?? conversation.created_at
  if (!value) return 'Recent'

  const date = new Date(value)
  return isValid(date) ? format(date, 'MMM d, yyyy') : 'Recent'
}

function ConversationHistory({ activeConversationId }: { activeConversationId?: string | null }) {
  const { isAuthenticated } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    let active = true

    conversationsApi.list()
      .then(({ data }) => {
        if (active) {
          setConversations(data)
          setError('')
        }
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
  }, [activeConversationId, isAuthenticated])

  return (
    <Card className="border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <History className="h-4 w-4 text-sky-600" />
            Conversations
          </div>
          <p className="mt-1 text-xs text-slate-500">Pick up where you left off</p>
        </div>
        <Button variant="outline" size="sm" asChild className="shrink-0 gap-1.5">
          <Link to="/">
            <Plus className="h-3.5 w-3.5" />
            New chat
          </Link>
        </Button>
      </div>

      {!isAuthenticated ? (
        <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
          Sign in to save and revisit conversations.
        </p>
      ) : loading ? (
        <p role="status" className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">Loading conversations...</p>
      ) : error ? (
        <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>
      ) : conversations.length === 0 ? (
        <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">Your conversations will appear here.</p>
      ) : (
        <nav aria-label="Conversation history" className="max-h-[min(60vh,36rem)] space-y-1 overflow-y-auto pr-1">
          {conversations.map((conversation) => (
            <NavLink
              key={conversation.id}
              to={`/conversation/${conversation.id}`}
              aria-current={activeConversationId === conversation.id ? 'page' : undefined}
              className={({ isActive }) =>
                `block rounded-xl border px-3 py-3 transition-colors ${
                  isActive || activeConversationId === conversation.id
                    ? 'border-sky-200 bg-sky-50'
                    : 'border-transparent hover:border-slate-200 hover:bg-slate-50'
                }`
              }
            >
              <div className="flex items-start gap-2.5">
                <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-slate-800">
                    {getConversationTitle(conversation)}
                  </span>
                  <span className="mt-1 block text-xs text-slate-500">{getConversationDate(conversation)}</span>
                </span>
              </div>
            </NavLink>
          ))}
        </nav>
      )}
    </Card>
  )
}

export function ChatWorkspace({ conversationId = null }: { conversationId?: string | null }) {
  return (
    <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-start gap-6 px-4 py-6 md:px-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:px-8">
      <div className="min-w-0">
        <ChatWidget key={conversationId ?? 'new-conversation'} conversationId={conversationId} />
      </div>
      <aside className="w-full lg:sticky lg:top-24">
        <ConversationHistory activeConversationId={conversationId} />
      </aside>
    </div>
  )
}
