export class SecurityUtils {
  // CSRF Token generation and validation
  static generateCSRFToken(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
  }

  static validateCSRFToken(token: string, storedToken: string): boolean {
    return token === storedToken && token.length === 64
  }

  // Enhanced rate limiting with different tiers
  static checkAdvancedRateLimit(
    key: string,
    tier: "login" | "payment" | "api" | "download" = "api",
  ): { allowed: boolean; remainingAttempts: number; resetTime: number } {
    const limits = {
      login: { maxAttempts: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
      payment: { maxAttempts: 3, windowMs: 10 * 60 * 1000 }, // 3 attempts per 10 minutes
      api: { maxAttempts: 100, windowMs: 60 * 1000 }, // 100 requests per minute
      download: { maxAttempts: 10, windowMs: 60 * 1000 }, // 10 downloads per minute
    }

    const { maxAttempts, windowMs } = limits[tier]
    const now = Date.now()
    const attempts = JSON.parse(localStorage.getItem(`rate_limit_${tier}_${key}`) || "[]")

    // Remove old attempts outside the window
    const recentAttempts = attempts.filter((timestamp: number) => now - timestamp < windowMs)
    const remainingAttempts = Math.max(0, maxAttempts - recentAttempts.length)
    const resetTime = recentAttempts.length > 0 ? recentAttempts[0] + windowMs : now

    if (recentAttempts.length >= maxAttempts) {
      return { allowed: false, remainingAttempts: 0, resetTime }
    }

    // Add current attempt
    recentAttempts.push(now)
    localStorage.setItem(`rate_limit_${tier}_${key}`, JSON.stringify(recentAttempts))

    return { allowed: true, remainingAttempts: remainingAttempts - 1, resetTime }
  }

  // Secure file validation
  static validateFileUpload(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ["text/plain", "text/csv", "application/csv"]
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: "Invalid file type. Only text and CSV files are allowed." }
    }

    if (file.size > maxSize) {
      return { valid: false, error: "File size too large. Maximum size is 5MB." }
    }

    // Check for suspicious file names
    const suspiciousPatterns = [/\.exe$/i, /\.bat$/i, /\.cmd$/i, /\.scr$/i, /\.js$/i, /\.php$/i]
    if (suspiciousPatterns.some((pattern) => pattern.test(file.name))) {
      return { valid: false, error: "Suspicious file name detected." }
    }

    return { valid: true }
  }

  // Enhanced input sanitization
  static sanitizeAndValidateInput(
    input: string,
    type: "text" | "email" | "phone" | "amount" = "text",
  ): {
    sanitized: string
    valid: boolean
    error?: string
  } {
    let sanitized = input.trim()

    // Remove potentially dangerous characters
    sanitized = sanitized
      .replace(/[<>]/g, "") // Remove HTML tags
      .replace(/javascript:/gi, "") // Remove javascript protocol
      .replace(/on\w+=/gi, "") // Remove event handlers
      .replace(/['"`;\\]/g, "") // Remove SQL injection characters

    // Type-specific validation
    switch (type) {
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(sanitized)) {
          return { sanitized, valid: false, error: "Invalid email format" }
        }
        break

      case "phone":
        const phoneRegex = /^[+]?[1-9][\d\s\-()]{7,15}$/
        if (!phoneRegex.test(sanitized)) {
          return { sanitized, valid: false, error: "Invalid phone number format" }
        }
        break

      case "amount":
        const amountRegex = /^\d+(\.\d{1,2})?$/
        if (!amountRegex.test(sanitized)) {
          return { sanitized, valid: false, error: "Invalid amount format" }
        }
        const amount = Number.parseFloat(sanitized)
        if (amount <= 0 || amount > 10000000) {
          return { sanitized, valid: false, error: "Amount must be between 0 and 10,000,000" }
        }
        break

      case "text":
        if (sanitized.length > 1000) {
          return { sanitized: sanitized.substring(0, 1000), valid: false, error: "Text too long (max 1000 characters)" }
        }
        break
    }

    return { sanitized, valid: true }
  }

  // Session security
  static generateSecureSessionId(): string {
    const array = new Uint8Array(16)
    crypto.getRandomValues(array)
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
  }

  static validateSession(sessionId: string): boolean {
    const session = localStorage.getItem(`session_${sessionId}`)
    if (!session) return false

    const sessionData = JSON.parse(session)
    const now = Date.now()
    const sessionAge = now - sessionData.createdAt
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours

    if (sessionAge > maxAge) {
      localStorage.removeItem(`session_${sessionId}`)
      return false
    }

    return true
  }

  // Secure credential file generation
  static generateSecureCredentialFile(orderData: any, credential: any): string {
    const timestamp = new Date().toISOString()
    const securityNotice = `
SECURITY NOTICE:
- This file contains sensitive login credentials
- Do not share this file with anyone
- Store this file in a secure location
- Delete this file after use if no longer needed
- Report any unauthorized access to abefesocialhub@gmail.com

File generated on: ${timestamp}
Order ID: ${orderData.id}
Security Hash: ${this.generateFileHash(orderData.id + credential.username)}
`

    return `${securityNotice}

PRODUCT DETAILS:
Product: ${orderData.productName}
Category: ${orderData.productCategory}
Order Date: ${orderData.purchaseDate}
Status: Active

LOGIN CREDENTIALS:
Username: ${credential.username}
Password: ${credential.password}

SUPPORT:
Email: abefesocialhub@gmail.com
Phone: 09152839443

---
© ${new Date().getFullYear()} Abefe Social Hub. All rights reserved.
This file is confidential and intended solely for the authorized user.
`
  }

  private static generateFileHash(input: string): string {
    let hash = 0
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).toUpperCase()
  }

  // Audit logging
  static logSecurityEvent(event: string, details: any, severity: "low" | "medium" | "high" = "medium") {
    const securityLog = {
      id: Date.now().toString(),
      event,
      details,
      severity,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      ip: "client-side", // In production, this would be server-side
    }

    const existingLogs = JSON.parse(localStorage.getItem("security-logs") || "[]")
    existingLogs.push(securityLog)
    localStorage.setItem("security-logs", JSON.stringify(existingLogs.slice(-1000))) // Keep last 1000 events
  }
}
