import axios from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'

import type { ApiErrorPayload } from '../types/api'

export const API_KEY = 'fbeyfgebfdegdjebhfdeifgjebsdd'
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000').replace(/\/+$/, '')

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
})

const AUTH_STORAGE_KEYS = {
  access: 'auralis.access_token',
  refresh: 'auralis.refresh_token',
  user: 'auralis.user',
} as const

export const authStorage = {
  getAccessToken: () => localStorage.getItem(AUTH_STORAGE_KEYS.access),
  getRefreshToken: () => localStorage.getItem(AUTH_STORAGE_KEYS.refresh),
  setTokens: (accessToken: string | null, refreshToken: string | null) => {
    if (accessToken) {
      localStorage.setItem(AUTH_STORAGE_KEYS.access, accessToken)
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEYS.access)
    }

    if (refreshToken) {
      localStorage.setItem(AUTH_STORAGE_KEYS.refresh, refreshToken)
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEYS.refresh)
    }
  },
  clearSession: () => {
    localStorage.removeItem(AUTH_STORAGE_KEYS.access)
    localStorage.removeItem(AUTH_STORAGE_KEYS.refresh)
    localStorage.removeItem(AUTH_STORAGE_KEYS.user)
  },
  getUser: () => {
    const rawUser = localStorage.getItem(AUTH_STORAGE_KEYS.user)

    if (!rawUser) {
      return null
    }

    try {
      return JSON.parse(rawUser) as { id: string; name: string; email: string }
    } catch {
      return null
    }
  },
  setUser: (user: { id: string; name: string; email: string } | null) => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(user))
      return
    }

    localStorage.removeItem(AUTH_STORAGE_KEYS.user)
  },
}

let isRefreshing = false
let pendingRequests: Array<{
  resolve: (value: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  pendingRequests.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
      return
    }

    resolve(token)
  })

  pendingRequests = []
}

const normalizeHeaders = (config: InternalAxiosRequestConfig) => {
  config.headers = config.headers ?? {}
  config.headers['X-API-Key'] = API_KEY

  const accessToken = authStorage.getAccessToken()
  if (accessToken && !config.url?.includes('/auth/login') && !config.url?.includes('/auth/register')) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
}

apiClient.interceptors.request.use((config) => normalizeHeaders(config as InternalAxiosRequestConfig))

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { __isRetry?: boolean }) | undefined

    if (!originalRequest || !error.response) {
      return Promise.reject(error)
    }

    const isAuthEndpoint =
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/logout')

    if (error.response.status === 401 && !originalRequest.__isRetry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingRequests.push({
            resolve: () => {
              const nextConfig = { ...originalRequest, __isRetry: true }
              resolve(apiClient.request(nextConfig))
            },
            reject,
          })
        })
      }

      isRefreshing = true

      try {
        const refreshToken = authStorage.getRefreshToken()
        if (!refreshToken) {
          throw new Error('Missing refresh token')
        }

        const refreshResponse = await axios.post(
          `${API_BASE_URL}/api/v1/auth/refresh`,
          { refresh_token: refreshToken },
          {
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': API_KEY,
            },
          },
        )

        const nextAccessToken = refreshResponse.data.access_token as string
        if (!nextAccessToken) {
          throw new Error('No access token returned from refresh')
        }

        authStorage.setTokens(nextAccessToken, refreshToken)
        normalizeHeaders(originalRequest)
        originalRequest.__isRetry = true
        processQueue(null, nextAccessToken)

        return apiClient.request(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError)
        authStorage.clearSession()
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

export const formatApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    const payload = error.response?.data as ApiErrorPayload | undefined

    if (status === 400) {
      const detail = payload?.detail
      if (Array.isArray(detail)) {
        return detail.map((item) => item.msg ?? item.message ?? 'Validation error').join(', ')
      }
      if (typeof detail === 'string') {
        return detail
      }
      if (detail && typeof detail === 'object' && 'message' in detail && detail.message) {
        return detail.message
      }
      return 'Please check your input and try again.'
    }

    if (status === 401) {
      return 'Your session has expired. Please sign in again.'
    }

    if (status === 404) {
      return 'The requested resource could not be found.'
    }

    if (status === 409) {
      return 'This request conflicts with the current state. Please try again.'
    }

    if (status === 500) {
      return 'The server encountered an error. Please try again shortly.'
    }

    if (error.message === 'Network Error') {
      return 'Network connection issue. Please check your internet connection.'
    }
  }

  return 'Something went wrong. Please try again.'
}

export const apiBaseUrl = API_BASE_URL
