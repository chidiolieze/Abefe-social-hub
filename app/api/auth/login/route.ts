import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database-service"
import { ValidationUtils } from "@/lib/validation"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Input validation
    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Please fill in all fields" }, { status: 400 })
    }

    // Sanitize inputs
    const sanitizedEmail = ValidationUtils.sanitizeInput(email.toLowerCase())
    const sanitizedPassword = ValidationUtils.sanitizeInput(password)

    // Email format validation
    if (!ValidationUtils.isValidEmail(sanitizedEmail)) {
      return NextResponse.json({ success: false, message: "Please enter a valid email address" }, { status: 400 })
    }

    // Get user from database
    const user = await DatabaseService.getUserByEmail(sanitizedEmail)
    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid email or password" }, { status: 401 })
    }

    // Verify password
    const isValidPassword = ValidationUtils.verifyPassword(sanitizedPassword, user.password_hash)
    if (!isValidPassword) {
      return NextResponse.json({ success: false, message: "Invalid email or password" }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        balance: user.balance,
        totalSpent: user.total_spent,
        totalPurchases: user.total_purchases,
        activeAccounts: user.active_accounts,
        referralCode: user.referral_code,
        referralEarnings: user.referral_earnings,
        memberSince: new Date(user.created_at).getFullYear().toString(),
        createdAt: user.created_at,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, message: "An error occurred during login" }, { status: 500 })
  }
}
