import { apiClient } from './client'
import type { Conversation, CreateConversationRequest, UpdateConversationRequest } from '../types/api'

export const conversationsApi = {
  list: () => apiClient.get<Conversation[]>('/conversations'),
  create: (payload: CreateConversationRequest) => apiClient.post<Conversation>('/conversations', payload),
  getById: (conversationId: string) => apiClient.get<Conversation>(`/conversations/${conversationId}`),
  update: (conversationId: string, payload: UpdateConversationRequest) =>
    apiClient.patch<Conversation>(`/conversations/${conversationId}`, payload),
  remove: (conversationId: string) => apiClient.delete<{ message: string }>(`/conversations/${conversationId}`),
}
