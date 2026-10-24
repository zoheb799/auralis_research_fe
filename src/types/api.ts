export interface User {
  id: string
  name: string
  email: string
  created_at?: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  token_type: 'bearer'
  user: User
}

export interface RegisterResponse {
  id: string
  name: string
  email: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface RefreshResponse {
  access_token: string
  token_type: 'bearer'
}

export interface CreateConversationRequest {
  title: string
}

export interface UpdateConversationRequest {
  title: string
}

export interface CreateMessageRequest {
  content: string
}

export interface Conversation {
  id: string
  title: string
  created_at?: string
  updated_at?: string
}

export interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  created_at?: string
}

export interface ApiErrorPayload {
  detail?: string | { message?: string } | Array<{ msg?: string; message?: string }>
}
