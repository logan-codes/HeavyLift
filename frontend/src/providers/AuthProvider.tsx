import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { AuthUser, LoginCredentials } from '../types/database'
import { mockUsers, mockRoles } from '../mocks/data'

interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<boolean>
  logout: () => void
  hasRole: (roleName: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('auth_user')
    return stored ? JSON.parse(stored) : null
  })

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    // Simulate JWT authentication against mock users
    await new Promise(resolve => setTimeout(resolve, 800))

    const foundUser = mockUsers.find(u => u.email === credentials.email && u.status === 'Active')
    if (!foundUser) return false

    const role = mockRoles.find(r => r.role_id === foundUser.role_id)!
    const authUser: AuthUser = {
      user_id: foundUser.user_id,
      first_name: foundUser.first_name,
      last_name: foundUser.last_name,
      email: foundUser.email,
      role,
      status: foundUser.status,
      token: `eyJhbGciOiJIUzI1NiJ9.${btoa(JSON.stringify({ sub: foundUser.email, role: role.role_name, exp: Date.now() + 86400000 }))}`,
    }

    setUser(authUser)
    localStorage.setItem('auth_user', JSON.stringify(authUser))
    localStorage.setItem('auth_token', authUser.token)

    if (credentials.remember_me) {
      localStorage.setItem('remembered_email', credentials.email)
    } else {
      localStorage.removeItem('remembered_email')
    }

    return true
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_token')
  }, [])

  const hasRole = useCallback((roleName: string) => {
    return user?.role.role_name === roleName
  }, [user])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
