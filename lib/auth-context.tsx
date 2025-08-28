"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  email: string
  name: string
  phone: string
  balance: number
  totalSpent: number
  totalPurchases: number
  activeAccounts: number
  referralCode: string
  referralEarnings: number
  totalReferrals: number
  memberSince: string
  createdAt: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  register: (
    name: string,
    email: string,
    phone: string,
    password: string,
    referralCode?: string,
  ) => Promise<{ success: boolean; message: string }>
  logout: () => void
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; message: string }>
  refreshUser: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    const savedUserId = localStorage.getItem("abefe-current-user")
    if (savedUserId) {
      refreshUserData(savedUserId)
    } else {
      setIsLoading(false)
    }
  }, [])

  const refreshUserData = async (userId: string) => {
    try {
      const response = await fetch(`/api/user/profile?userId=${userId}`)
      const data = await response.json()

      if (data.success) {
        setUser(data.user)
      } else {
        // Invalid session, clear it
        localStorage.removeItem("abefe-current-user")
        setUser(null)
      }
    } catch (error) {
      console.error("Error refreshing user data:", error)
      localStorage.removeItem("abefe-current-user")
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshUser = async () => {
    if (user) {
      await refreshUserData(user.id)
    }
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success) {
        setUser(data.user)
        localStorage.setItem("abefe-current-user", data.user.id)
        setIsLoading(false)
        return { success: true, message: data.message }
      } else {
        setIsLoading(false)
        return { success: false, message: data.message }
      }
    } catch (error) {
      console.error("Login error:", error)
      setIsLoading(false)
      return { success: false, message: "An error occurred during login" }
    }
  }

  const register = async (
    name: string,
    email: string,
    phone: string,
    password: string,
    referralCode?: string,
  ): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, phone, password, referralCode }),
      })

      const data = await response.json()

      if (data.success) {
        setUser(data.user)
        localStorage.setItem("abefe-current-user", data.user.id)
        setIsLoading(false)
        return { success: true, message: data.message }
      } else {
        setIsLoading(false)
        return { success: false, message: data.message }
      }
    } catch (error) {
      console.error("Registration error:", error)
      setIsLoading(false)
      return { success: false, message: "An error occurred during registration" }
    }
  }

  const updateProfile = async (updates: Partial<User>): Promise<{ success: boolean; message: string }> => {
    if (!user) return { success: false, message: "User not authenticated" }

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id, updates }),
      })

      const data = await response.json()

      if (data.success) {
        setUser(data.user)
        return { success: true, message: data.message }
      } else {
        return { success: false, message: data.message }
      }
    } catch (error) {
      console.error("Profile update error:", error)
      return { success: false, message: "An error occurred while updating profile" }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("abefe-current-user")
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, refreshUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
