import { createContext } from 'react'
import type { Role, User } from '@/types'

export interface AuthContextType {
    user: User | null
    isLoading: boolean
    isAuthenticated: boolean
    login: (data: { username: string; password: string }) => Promise<void>
    register: (data: { username: string; email: string; password: string; country?: string; role: Role }) => Promise<void>
    logout: () => Promise<void>
    refreshSession: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
