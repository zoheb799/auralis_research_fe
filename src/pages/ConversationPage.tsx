import { useParams } from 'react-router-dom'

import { ChatWorkspace } from '../components/chat/ChatWorkspace'

export function ConversationPage() {
  const { conversationId } = useParams()

  return <ChatWorkspace conversationId={conversationId ?? null} />
}
