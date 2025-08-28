"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { useAuth } from "./auth-context"

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: "success" | "error" | "info" | "warning"
  read: boolean
  createdAt: string
  actionUrl?: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, "id" | "userId" | "read" | "createdAt">) => void
  markAsRead: (notificationId: string) => void
  markAllAsRead: () => void
  clearNotifications: () => void
  isPolling: boolean
  lastUpdate: string
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isPolling, setIsPolling] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string>("")
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const fetchingRef = useRef<boolean>(false)

  const fetchNotifications = useCallback(async () => {
    if (!user || fetchingRef.current) return

    fetchingRef.current = true
    setIsPolling(true)

    try {
      const response = await fetch(`/api/notifications?userId=${user.id}`, {
        signal: AbortSignal.timeout(5000),
      })

      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        setLastUpdate(new Date().toLocaleTimeString())
      } else {
        console.error("Failed to fetch notifications:", response.status)
      }
    } catch (error) {
      if (error.name === "TimeoutError") {
        console.error("Notification fetch timeout")
      } else if (error.name === "AbortError") {
        console.error("Notification fetch aborted")
      } else {
        console.error("Error fetching notifications:", error)
      }
    } finally {
      setIsPolling(false)
      fetchingRef.current = false
    }
  }, [user])

  useEffect(() => {
    if (user) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }

      fetchNotifications()

      intervalRef.current = setInterval(fetchNotifications, 15000)

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        fetchingRef.current = false
      }
    } else {
      setNotifications([])
      setLastUpdate("")
    }
  }, [user, fetchNotifications])

  const addNotification = useCallback(
    async (notification: Omit<Notification, "id" | "userId" | "read" | "createdAt">) => {
      if (!user) return

      try {
        const response = await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...notification,
            userId: user.id,
          }),
        })

        if (response.ok) {
          fetchNotifications()
        }
      } catch (error) {
        console.error("Error adding notification:", error)
      }
    },
    [user, fetchNotifications],
  )

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
        signal: AbortSignal.timeout(3000),
      })

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notif) => (notif.id === notificationId ? { ...notif, read: true } : notif)),
        )
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    if (!user) return

    try {
      const response = await fetch(`/api/notifications/mark-all-read`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      })

      if (response.ok) {
        setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }, [user])

  const clearNotifications = useCallback(async () => {
    if (!user) return

    try {
      const response = await fetch(`/api/notifications/clear`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      })

      if (response.ok) {
        setNotifications([])
      }
    } catch (error) {
      console.error("Error clearing notifications:", error)
    }
  }, [user])

  const unreadCount = notifications.filter((notif) => !notif.read).length

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        isPolling,
        lastUpdate,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}
