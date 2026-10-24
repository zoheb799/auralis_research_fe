import { apiClient } from './client'
import type { User } from '../types/api'

export const usersApi = {
  getMe: () => apiClient.get<User>('/users/me'),
  updateMe: (payload: { name: string }) => apiClient.patch<User>('/users/me', payload),
}
