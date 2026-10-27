import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUp, Paperclip, Sparkles, TrendingUp } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { conversationsApi } from '../../api/conversations'
import { messagesApi } from '../../api/messages'
import { formatApiError } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import type { Message } from '../../types/api'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Input } from '../ui/input'

const quickPrompts = [
  'stocks to invest in',
  'IPO opportunities this quarter',
  'mutual funds for long term',
]

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  stocks?: { id: string; name: string; symbol: string; price: number; historicalReturn: number }[]
}

interface ChatWidgetProps {
  conversationId?: string | null
}

const welcomeMessage: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    'I can help you screen stocks, IPOs, and mutual funds using historical context and research framing. Ask for ideas with an investment horizon in mind.',
}

const normalizeMessage = (message: Message): ChatMessage => ({
  id: message.id,
  role: message.role,
  content: message.content,
})

export function ChatWidget({ conversationId: routeConversationId }: ChatWidgetProps) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [query, setQuery] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingConversation, setIsLoadingConversation] = useState(false)
  const [error, setError] = useState('')
  const [pendingConversationId, setPendingConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>(routeConversationId ? [] : [welcomeMessage])
  const conversationLoadCancelledRef = useRef(false)
  const activeConversationId = routeConversationId ?? pendingConversationId

  useEffect(() => {
    if (!routeConversationId) {
      return
    }

    conversationLoadCancelledRef.current = false
    const loadMessages = async () => {
      setIsLoadingConversation(true)
      setError('')

      try {
        const response = await messagesApi.list(routeConversationId)
        if (conversationLoadCancelledRef.current) {
          return
        }

        const loadedMessages = response.data.map(normalizeMessage)

        setMessages((current) => {
          const hasPendingUserMessage = current.some(
            (message) => message.id.startsWith('local-') && message.role === 'user',
          )

          if (!hasPendingUserMessage) {
            return loadedMessages
          }

          if (loadedMessages.length === 0) {
            return current
          }

          const mergedIds = new Map<string, ChatMessage>()

          current
            .filter((message) => !message.id.startsWith('local-'))
            .forEach((message) => mergedIds.set(message.id, message))

          loadedMessages.forEach((message) => {
            mergedIds.set(message.id, message)
          })

          return Array.from(mergedIds.values())
        })
      } catch (requestError) {
        if (conversationLoadCancelledRef.current) {
          return
        }

        setMessages([])
        setError(formatApiError(requestError))
      } finally {
        if (!conversationLoadCancelledRef.current) {
          setIsLoadingConversation(false)
        }
      }
    }

    void loadMessages()

    return () => {
      conversationLoadCancelledRef.current = true
    }
  }, [routeConversationId])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedQuery = query.trim()

    if (!trimmedQuery || isSubmitting) {
      return
    }

    if (!isAuthenticated) {
      navigate('/login', { replace: true })
      return
    }

    const optimisticMessage: ChatMessage = {
      id: `local-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      role: 'user',
      content: trimmedQuery,
    }

    setMessages((current) => {
      const filtered = current[0]?.id === 'welcome' ? current.filter((message) => message.id !== 'welcome') : current
      return [...filtered, optimisticMessage]
    })
    setQuery('')
    setError('')
    setIsSubmitting(true)

    let createdConversationId: string | null = activeConversationId ?? routeConversationId ?? null

    try {
      if (!createdConversationId) {
        const createdConversation = await conversationsApi.create({
          title: trimmedQuery.slice(0, 60) || 'New conversation',
        })

        createdConversationId = createdConversation.data.id
        setPendingConversationId(createdConversationId)
      }

      if (!createdConversationId) {
        throw new Error('Conversation ID is missing.')
      }

      const response = await messagesApi.create(createdConversationId, { content: trimmedQuery })

      setMessages((current) => {
        const withoutOptimistic = current.filter((message) => message.id !== optimisticMessage.id)
        const withoutDuplicateResponse = withoutOptimistic.filter(
          (message) => !(message.id === response.data.id || (message.role === response.data.role && message.content === response.data.content && message.id !== optimisticMessage.id)),
        )

        return [...withoutDuplicateResponse, { id: response.data.id, role: response.data.role, content: response.data.content }]
      })

      if (!routeConversationId) {
        navigate(`/conversation/${createdConversationId}`)
      }
    } catch (requestError) {
      if (!createdConversationId) {
        setMessages((current) => current.filter((message) => message.id !== optimisticMessage.id))
      }

      setQuery(trimmedQuery)
      setError(formatApiError(requestError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-4xl">
      <div className="mb-6 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
          <Sparkles className="h-3.5 w-3.5" />
          AI investment research
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
          Research smarter. Invest with context.
        </h1>
      </div>

      <Card className="relative overflow-hidden border-slate-200 bg-white/85 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm">
        <div className="border-b border-slate-200/80 bg-slate-50/80 px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
            <TrendingUp className="h-3.5 w-3.5 text-sky-600" />
            Research assistant
          </div>
        </div>

        <div className="space-y-4 px-4 py-5 md:px-6">
          {error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>
          ) : null}

          {isLoadingConversation ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">Loading conversation...</div>
          ) : null}

          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                    message.role === 'user'
                      ? 'bg-sky-600 text-white'
                      : 'border border-slate-200 bg-slate-50 text-slate-700'
                  }`}
                >
                  {message.content}

                  {message.stocks && (
                    <div className="mt-4 space-y-2">
                      {message.stocks.map((stock) => (
                        <Link
                          key={stock.id}
                          to={`/stocks/${stock.id}`}
                          className="block rounded-xl border border-slate-200 bg-white p-3 transition-colors hover:border-sky-200 hover:bg-sky-50/60"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="font-medium text-slate-900">{stock.name}</div>
                              <div className="text-xs text-slate-500">{stock.symbol}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold text-slate-900">₹{stock.price.toLocaleString()}</div>
                              <div className="text-xs text-emerald-600">+{stock.historicalReturn}% historical return</div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isSubmitting && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                <span className="h-2 w-2 animate-pulse rounded-full bg-sky-500" />
                <span className="h-2 w-2 animate-pulse rounded-full bg-sky-500 [animation-delay:200ms]" />
                <span className="h-2 w-2 animate-pulse rounded-full bg-sky-500 [animation-delay:400ms]" />
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 bg-white/90 p-3 md:p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => setQuery(prompt)}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 transition-colors hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
              >
                {prompt}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex items-end gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-2 shadow-inner shadow-slate-100">
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:border-sky-200 hover:text-sky-700"
              aria-label="Attach file"
            >
              <Paperclip className="h-4 w-4" />
            </button>

            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={isAuthenticated ? 'Ask about stocks, IPOs, mutual funds...' : 'Sign in to start researching'}
              className="h-12 border-0 bg-transparent text-base shadow-none focus-visible:ring-0"
              disabled={!isAuthenticated || isSubmitting}
            />

            <Button
              type="submit"
              size="icon"
              className="h-11 w-11 rounded-xl bg-sky-600 text-white hover:bg-sky-700"
              disabled={isSubmitting || !isAuthenticated}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}
