"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"

interface CredentialDownloadButtonProps {
  orderId: string
  productName: string
  size?: "sm" | "default" | "lg"
  variant?: "default" | "outline" | "secondary"
}

export function CredentialDownloadButton({
  orderId,
  productName,
  size = "default",
  variant = "default",
}: CredentialDownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const response = await fetch(`/api/credentials/download/${orderId}`)

      if (!response.ok) {
        throw new Error("Failed to download credentials")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `credentials_${orderId}.txt`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Download error:", error)
      alert("Failed to download credentials. Please try again.")
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Button onClick={handleDownload} disabled={isDownloading} size={size} variant={variant} className="gap-2">
      {isDownloading ? (
        <>
          <FileText className="h-4 w-4 animate-pulse" />
          Downloading...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Download Credentials
        </>
      )}
    </Button>
  )
}
