import { useParams } from 'react-router-dom'

import { ChatWidget } from '../components/chat/ChatWidget'

export function HistoryDetailsPage() {
  const { historyId } = useParams()

  return <ChatWidget key={historyId ?? 'history'} conversationId={historyId ?? null} />
}
