"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface AdminUser {
  id: string
  email: string
  name: string
  role: "admin"
}

interface AdminAuthContextType {
  admin: AdminUser | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

const ADMIN_CREDENTIALS = {
  email: "admin@abefesocialhub.com",
  password: "AbefeSocialHub2024!",
}

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing admin session on mount
    const savedAdmin = localStorage.getItem("abefe-admin")
    if (savedAdmin) {
      setAdmin(JSON.parse(savedAdmin))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check admin credentials
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      const adminUser: AdminUser = {
        id: "admin-1",
        email: ADMIN_CREDENTIALS.email,
        name: "Admin",
        role: "admin",
      }

      setAdmin(adminUser)
      localStorage.setItem("abefe-admin", JSON.stringify(adminUser))
      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }

  const logout = () => {
    setAdmin(null)
    localStorage.removeItem("abefe-admin")
  }

  return <AdminAuthContext.Provider value={{ admin, login, logout, isLoading }}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider")
  }
  return context
}
