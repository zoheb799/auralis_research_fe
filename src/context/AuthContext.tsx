import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { authApi } from '../api/auth'
import { authStorage } from '../api/client'
import { usersApi } from '../api/users'
import type { LoginRequest, RegisterRequest, User } from '../types/api'

interface AuthContextValue {
  user: User | null
  accessToken: string | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  login: (payload: LoginRequest) => Promise<void>
  register: (payload: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  refreshAccessToken: () => Promise<string | null>
  loadUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState<User | null>(authStorage.getUser())
  const [accessToken, setAccessToken] = useState<string | null>(authStorage.getAccessToken())
  const [loading, setLoading] = useState(true)

  const clearSession = useCallback(() => {
    authStorage.clearSession()
    setUser(null)
    setAccessToken(null)
  }, [])

  const refreshAccessToken = useCallback(async () => {
    const refreshToken = authStorage.getRefreshToken()
    if (!refreshToken) {
      clearSession()
      return null
    }

    try {
      const response = await authApi.refresh(refreshToken)
      const nextAccessToken = response.data.access_token
      authStorage.setTokens(nextAccessToken, refreshToken)
      setAccessToken(nextAccessToken)
      return nextAccessToken
    } catch (error) {
      clearSession()
      return null
    }
  }, [clearSession])

  const loadUser = useCallback(async () => {
    const storedAccessToken = authStorage.getAccessToken()
    if (!storedAccessToken) {
      setUser(null)
      setAccessToken(null)
      setLoading(false)
      return
    }

    setLoading(true)

    try {
      const response = await usersApi.getMe()
      const nextUser = response.data
      authStorage.setUser(nextUser)
      setUser(nextUser)
      setAccessToken(storedAccessToken)
    } catch (error) {
      const failedRefresh = await refreshAccessToken()
      if (!failedRefresh) {
        clearSession()
        if (location.pathname !== '/login' && location.pathname !== '/register') {
          navigate('/login', { replace: true })
        }
        return
      }

      try {
        const retryResponse = await usersApi.getMe()
        const nextUser = retryResponse.data
        authStorage.setUser(nextUser)
        setUser(nextUser)
        setAccessToken(authStorage.getAccessToken())
      } catch {
        clearSession()
        if (location.pathname !== '/login' && location.pathname !== '/register') {
          navigate('/login', { replace: true })
        }
      }
    } finally {
      setLoading(false)
    }
  }, [clearSession, location.pathname, navigate, refreshAccessToken])

  useEffect(() => {
    void loadUser()
  }, [loadUser])

  const persistAuthSession = useCallback((payload: { access_token: string; refresh_token: string; user: User }) => {
    authStorage.setTokens(payload.access_token, payload.refresh_token)
    authStorage.setUser(payload.user)
    setAccessToken(payload.access_token)
    setUser(payload.user)
  }, [])

  const login = useCallback(
    async (payload: LoginRequest) => {
      const response = await authApi.login(payload)
      persistAuthSession(response.data)
      navigate('/', { replace: true })
    },
    [navigate, persistAuthSession],
  )

  const register = useCallback(
    async (payload: RegisterRequest) => {
      await authApi.register({
        name: payload.name,
        email: payload.email,
        password: payload.password,
      })
      navigate('/login', { replace: true })
    },
    [navigate],
  )

  const logout = useCallback(async () => {
    const refreshToken = authStorage.getRefreshToken()

    try {
      if (refreshToken) {
        await authApi.logout(refreshToken)
      }
    } catch (error) {
      // Ignore backend logout errors and clear local session.
    } finally {
      clearSession()
      navigate('/login', { replace: true })
    }
  }, [clearSession, navigate])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      token: accessToken,
      isAuthenticated: Boolean(accessToken && user),
      loading,
      login,
      register,
      logout,
      refreshAccessToken,
      loadUser,
    }),
    [accessToken, loadUser, loading, login, logout, refreshAccessToken, register, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
