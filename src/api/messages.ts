import { apiClient } from './client'
import type { CreateMessageRequest, Message } from '../types/api'

export const messagesApi = {
  list: (conversationId: string) => apiClient.get<Message[]>(`/conversations/${conversationId}/messages`),
  create: (conversationId: string, payload: CreateMessageRequest) =>
    apiClient.post<Message>(`/conversations/${conversationId}/messages`, payload),
}
