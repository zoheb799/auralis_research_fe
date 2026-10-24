import { authApi } from '../api/auth'
import type { LoginRequest, RegisterRequest } from '../types/api'

export interface AuthCredentials extends LoginRequest {}
export interface AuthSignup extends RegisterRequest {}

export const authService = {
  login: async (data: AuthCredentials) => authApi.login(data),
  register: async (data: AuthSignup) => authApi.register(data),
}
