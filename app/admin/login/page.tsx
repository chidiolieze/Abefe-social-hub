"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminLoginForm } from "@/components/admin/admin-login-form"
import { useAdminAuth } from "@/lib/admin-auth"

export default function AdminLoginPage() {
  const { admin } = useAdminAuth()
  const router = useRouter()

  useEffect(() => {
    if (admin) {
      router.push("/admin")
    }
  }, [admin, router])

  if (admin) {
    return null // Redirecting
  }

  return <AdminLoginForm />
}
