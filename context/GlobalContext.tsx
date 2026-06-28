'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { AuthUser } from '@/lib/types'

interface GlobalContextType {
  user: AuthUser | null
  token: string | null
  login: (jwt: string, user: AuthUser) => void
  logout: () => void
  isLoading: boolean
}

const GlobalContext = createContext<GlobalContextType | null>(null)

export function GlobalProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token')
    const savedUser = localStorage.getItem('auth_user')

    if (savedToken && savedUser) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
      }
    }
    setIsLoading(false)
  }, [])

  function login(jwt: string, userData: AuthUser) {
    localStorage.setItem('auth_token', jwt)
    localStorage.setItem('auth_user', JSON.stringify(userData))
    setToken(jwt)
    setUser(userData)
  }

  function logout() {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    setToken(null)
    setUser(null)
  }

  return (
    <GlobalContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </GlobalContext.Provider>
  )
}

export function useGlobal(): GlobalContextType {
  const ctx = useContext(GlobalContext)
  if (!ctx) throw new Error('useGlobal must be used within GlobalProvider')
  return ctx
}
