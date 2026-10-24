import { apiClient } from './client'
import type { AuthResponse, LoginRequest, RefreshResponse, RegisterRequest, RegisterResponse } from '../types/api'

export const authApi = {
  health: () => apiClient.get<{ status: string }>('/health'),
  register: (payload: RegisterRequest) => apiClient.post<RegisterResponse>('/auth/register', payload),
  login: (payload: LoginRequest) => apiClient.post<AuthResponse>('/auth/login', payload),
  refresh: (refreshToken: string) =>
    apiClient.post<RefreshResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    }),
  logout: (refreshToken: string) =>
    apiClient.post<{ message: string }>('/auth/logout', {
      refresh_token: refreshToken,
    }),
}
