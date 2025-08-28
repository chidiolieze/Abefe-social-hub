export class ValidationUtils {
  // Email validation
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email.trim())
  }

  // Password strength validation
  static isValidPassword(password: string): { isValid: boolean; message: string } {
    if (password.length < 8) {
      return { isValid: false, message: "Password must be at least 8 characters long" }
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return { isValid: false, message: "Password must contain at least one lowercase letter" }
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return { isValid: false, message: "Password must contain at least one uppercase letter" }
    }
    if (!/(?=.*\d)/.test(password)) {
      return { isValid: false, message: "Password must contain at least one number" }
    }
    return { isValid: true, message: "Password is strong" }
  }

  // Phone number validation
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
    return phoneRegex.test(phone.replace(/[\s\-$$$$]/g, ""))
  }

  // Name validation
  static isValidName(name: string): boolean {
    const nameRegex = /^[a-zA-Z\s]{2,50}$/
    return nameRegex.test(name.trim())
  }

  // Input sanitization
  static sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, "") // Remove potential HTML tags
      .replace(/javascript:/gi, "") // Remove javascript: protocol
      .replace(/on\w+=/gi, "") // Remove event handlers
  }

  // SQL injection prevention (basic)
  static sanitizeForDatabase(input: string): string {
    return input
      .replace(/['";\\]/g, "") // Remove SQL injection characters
      .trim()
  }

  // Rate limiting check
  static checkRateLimit(key: string, maxAttempts = 5, windowMs: number = 15 * 60 * 1000): boolean {
    const now = Date.now()
    const attempts = JSON.parse(localStorage.getItem(`rate_limit_${key}`) || "[]")

    // Remove old attempts outside the window
    const recentAttempts = attempts.filter((timestamp: number) => now - timestamp < windowMs)

    if (recentAttempts.length >= maxAttempts) {
      return false // Rate limit exceeded
    }

    // Add current attempt
    recentAttempts.push(now)
    localStorage.setItem(`rate_limit_${key}`, JSON.stringify(recentAttempts))

    return true // Within rate limit
  }

  // Simple password hashing (for demo purposes - use bcrypt in production)
  static hashPassword(password: string): string {
    // Simple hash for demo - in production use bcrypt or similar
    let hash = 0
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString(36)
  }

  // Verify hashed password
  static verifyPassword(password: string, hash: string): boolean {
    return this.hashPassword(password) === hash
  }
}
