import * as Dialog from '@radix-ui/react-dialog'
import { ArrowUp, LoaderCircle, MessageSquarePlus, Sparkles, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { conversationsApi } from '../../api/conversations'
import { formatApiError } from '../../api/client'
import { messagesApi } from '../../api/messages'
import { MarkdownMessage } from '../chat/MarkdownMessage'
import { useAuth } from '../../context/AuthContext'
import {
  getInitialResearchPrompt,
  getResearchCategoryFromTitle,
  getResearchSuggestions,
  getResearchTitle,
  type ResearchAsset,
} from '../../lib/assetResearch'
import type { Message } from '../../types/api'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'

interface AssetResearchDrawerProps {
  asset: ResearchAsset
  className?: string
}

const normalizeMessage = (message: Message) => ({
  id: message.id,
  role: message.role,
  content: message.content,
})

export function AssetResearchDrawer({ asset, className }: AssetResearchDrawerProps) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Array<ReturnType<typeof normalizeMessage>>>([])
  const [query, setQuery] = useState('')
  const [isInitializing, setIsInitializing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasSentInitialPrompt, setHasSentInitialPrompt] = useState(false)
  const [error, setError] = useState('')
  const activeConversationId = useRef<string | null>(null)
  const initializationInProgress = useRef(false)
  const submissionInProgress = useRef(false)
  const optimisticMessageCounter = useRef(0)
  const initialPromptSent = useRef(false)
  const messageListRef = useRef<HTMLDivElement>(null)
  const initialPrompt = getInitialResearchPrompt(asset)
  const title = getResearchTitle(asset)

  useEffect(() => {
    const messageList = messageListRef.current
    if (messageList) messageList.scrollTop = messageList.scrollHeight
  }, [messages, isInitializing, isSubmitting])

  const submitMessage = async (content: string, id: string) => {
    if (submissionInProgress.current) return false

    submissionInProgress.current = true
    setIsSubmitting(true)
    setError('')
    optimisticMessageCounter.current += 1
    const optimisticId = `local-${optimisticMessageCounter.current}`
    setMessages((current) => [...current, { id: optimisticId, role: 'user' as const, content }])

    try {
      const response = await messagesApi.create(id, { content })
      if (!response.data.content.trim()) {
        throw new Error('AURALIS returned an empty response. Please try again.')
      }

      setMessages((current) => [
        ...current.filter((message) => message.id !== response.data.id),
        normalizeMessage(response.data),
      ])
      return true
    } catch (requestError) {
      setMessages((current) => current.filter((message) => message.id !== optimisticId))
      setError(
        requestError instanceof Error && requestError.message.startsWith('AURALIS')
          ? requestError.message
          : formatApiError(requestError),
      )
      return false
    } finally {
      submissionInProgress.current = false
      setIsSubmitting(false)
    }
  }

  const sendInitialPrompt = async (id: string) => {
    const sent = await submitMessage(initialPrompt, id)
    if (sent) {
      initialPromptSent.current = true
      setHasSentInitialPrompt(true)
    }
  }

  const initializeResearch = async (createNew = false) => {
    if (!isAuthenticated || initializationInProgress.current) return

    if (!createNew && activeConversationId.current) {
      if (!initialPromptSent.current) await sendInitialPrompt(activeConversationId.current)
      return
    }

    initializationInProgress.current = true
    setIsInitializing(true)
    setError('')

    try {
      let id: string | null = null
      if (!createNew) {
        const existing = await conversationsApi.list()
        const matchingConversation = existing.data.find((conversation) => conversation.title === title)

        if (matchingConversation) {
          id = matchingConversation.id
          activeConversationId.current = id
          setConversationId(id)
          const response = await messagesApi.list(id)
          const loadedMessages = response.data.map(normalizeMessage)
          setMessages(loadedMessages)
          initialPromptSent.current = loadedMessages.length > 0
          setHasSentInitialPrompt(loadedMessages.length > 0)
        }
      }

      if (!id) {
        const created = await conversationsApi.create({ title })
        id = created.data.id
        activeConversationId.current = id
        setConversationId(id)
        setMessages([])
        initialPromptSent.current = false
        setHasSentInitialPrompt(false)
      }

      if (!initialPromptSent.current) await sendInitialPrompt(id)
    } catch (requestError) {
      setError(formatApiError(requestError))
    } finally {
      initializationInProgress.current = false
      setIsInitializing(false)
    }
  }

  const handleOpen = () => {
    setOpen(true)
    void initializeResearch()
  }

  const handleNewResearch = () => {
    if (isInitializing || isSubmitting || submissionInProgress.current) return
    activeConversationId.current = null
    initialPromptSent.current = false
    setHasSentInitialPrompt(false)
    setConversationId(null)
    setMessages([])
    setQuery('')
    setError('')
    void initializeResearch(true)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const content = query.trim()
    const id = activeConversationId.current
    if (!content || !id || isInitializing || isSubmitting || submissionInProgress.current) return

    setQuery('')
    const sent = await submitMessage(content, id)
    if (!sent) setQuery(content)
  }

  const suggestions = getResearchSuggestions(asset.category)
  const category = getResearchCategoryFromTitle(title)

  return (
    <>
      <Button
        type="button"
        onClick={handleOpen}
        className={`h-11 gap-2 rounded-xl bg-sky-600 px-4 font-semibold text-white shadow-sm hover:bg-sky-700 ${className ?? ''}`}
      >
        <Sparkles className="w-4 h-4" />
        Research with AURALIS AI
      </Button>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[100] bg-slate-950/35 backdrop-blur-[2px] data-[state=open]:animate-[research-fade-in_180ms_ease-out] data-[state=closed]:animate-[research-fade-out_180ms_ease-in]" />
          <Dialog.Content className="fixed inset-y-0 right-0 z-[101] flex h-[100dvh] w-full max-w-[560px] flex-col border-l border-slate-200 bg-white shadow-2xl outline-none dark:border-slate-800 dark:bg-slate-950 data-[state=open]:animate-[research-drawer-in_260ms_cubic-bezier(0.16,1,0.3,1)] data-[state=closed]:animate-[research-drawer-out_220ms_ease-in] max-sm:inset-0 max-sm:max-w-none max-sm:border-0">
            <Dialog.Title className="sr-only">AURALIS AI research for {asset.name}</Dialog.Title>
            <Dialog.Description className="sr-only">
              Contextual investment research conversation for {asset.name}.
            </Dialog.Description>

            <header className="px-5 py-4 border-b shrink-0 border-slate-200 dark:border-slate-800 sm:px-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-900 dark:text-white">
                    <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-200">
                      <Sparkles className="w-4 h-4" />
                    </span>
                    AURALIS AI
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                      Research
                    </span>
                  </div>
                  <h2 className="mt-3 text-base font-semibold truncate text-slate-900 dark:text-white">
                    {asset.name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {asset.symbol && <span className="font-medium tracking-wide uppercase">{asset.symbol}</span>}
                    <span className="rounded-full border border-slate-200 px-2 py-0.5 dark:border-slate-700">
                      {category ?? asset.category}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Start a new research conversation"
                    title="New research"
                    onClick={handleNewResearch}
                    disabled={isInitializing || isSubmitting}
                  >
                    <MessageSquarePlus className="w-4 h-4" />
                  </Button>
                  <Dialog.Close asChild>
                    <Button variant="ghost" size="icon" aria-label="Close research drawer">
                      <X className="w-4 h-4" />
                    </Button>
                  </Dialog.Close>
                </div>
              </div>
            </header>

            <section aria-label="Asset context" className="px-5 py-3 border-b shrink-0 border-slate-100 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/60 sm:px-6">
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {(asset.context ?? []).length > 0 ? asset.context?.map(({ label, value }) => (
                  <div key={label} className="min-w-0">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
                    <p className="mt-0.5 max-w-[220px] truncate text-xs font-semibold text-slate-800 dark:text-slate-100">{value}</p>
                  </div>
                )) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400">Researching available asset information</p>
                )}
              </div>
            </section>

            {!isAuthenticated ? (
              <div className="flex flex-col items-center justify-center flex-1 px-8 text-center">
                <Sparkles className="w-8 h-8 mb-4 text-sky-600" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Sign in to start research</h3>
                <p className="max-w-sm mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Your research conversations are saved to your AURALIS history.
                </p>
                <Button asChild className="mt-5">
                  <Link to="/login" state={{ from: location }}>Sign in</Link>
                </Button>
              </div>
            ) : (
              <>
                <div
                  ref={messageListRef}
                  aria-live="polite"
                  className="flex-1 min-h-0 px-5 py-5 space-y-5 overflow-y-auto overscroll-contain sm:px-6"
                >
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[92%] min-w-0 rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-sky-600 text-white'
                          : 'border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900'
                      }`}>
                        {message.role === 'assistant' ? (
                          <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">
                            <Sparkles className="w-3 h-3" /> AURALIS AI
                          </div>
                        ) : null}
                        {message.role === 'assistant'
                          ? <MarkdownMessage content={message.content} darkMode />
                          : <p className="text-sm leading-6 text-white break-words whitespace-pre-wrap">{message.content}</p>}
                      </div>
                    </div>
                  ))}

                  {(isInitializing || isSubmitting) && (
                    <div role="status" className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <LoaderCircle className="w-4 h-4 animate-spin text-sky-600" />
                      {isInitializing ? 'Preparing your research session…' : 'AURALIS is researching…'}
                    </div>
                  )}

                  {error && (
                    <div role="alert" className="p-3 text-sm border rounded-xl border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200">
                      <p>{error}</p>
                      {conversationId && !hasSentInitialPrompt && !isInitializing && !isSubmitting && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={() => void sendInitialPrompt(conversationId)}
                        >
                          Retry initial research
                        </Button>
                      )}
                      {!conversationId && !isInitializing && !isSubmitting && (
                        <Button variant="outline" size="sm" className="mt-3" onClick={() => void initializeResearch()}>
                          Retry
                        </Button>
                      )}
                    </div>
                  )}

                  {!isInitializing && messages.length === 0 && !error && (
                    <p className="py-8 text-sm text-center text-slate-500 dark:text-slate-400">
                      Your asset research will appear here.
                    </p>
                  )}
                </div>

                {messages.length > 0 && !isSubmitting && !isInitializing && (
                  <div className="px-5 pb-3 shrink-0 sm:px-6">
                    <div className="flex gap-2 pb-1 overflow-x-auto">
                      {suggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => setQuery(suggestion)}
                          className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 transition-colors hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-sky-800 dark:hover:bg-sky-950"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="shrink-0 border-t border-slate-200 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] dark:border-slate-800 dark:bg-slate-950 sm:px-6">
                  <div className="flex items-end gap-2 p-2 border rounded-2xl border-slate-200 bg-slate-50 focus-within:border-sky-300 dark:border-slate-700 dark:bg-slate-900">
                    <Textarea
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' && !event.shiftKey) {
                          event.preventDefault()
                          event.currentTarget.form?.requestSubmit()
                        }
                      }}
                      rows={2}
                      aria-label="Message AURALIS AI"
                      placeholder="Ask a follow-up about this asset…"
                      className="max-h-32 min-h-11 resize-none border-0 bg-white px-2 py-2 text-slate-900 shadow-none placeholder:text-slate-400 focus-visible:ring-0 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                      disabled={!conversationId || isInitializing || isSubmitting || !hasSentInitialPrompt}
                    />
                    <Button
                      type="submit"
                      size="icon"
                      aria-label="Send message"
                      className="w-10 h-10 text-white shrink-0 rounded-xl bg-sky-600 hover:bg-sky-700"
                      disabled={!query.trim() || !conversationId || isInitializing || isSubmitting || !hasSentInitialPrompt}
                    >
                      {isSubmitting ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <ArrowUp className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="mt-2 text-center text-[10px] text-slate-400">
                    AI research is informational and does not guarantee investment outcomes.
                  </p>
                </form>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
