import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database-service"
import { ValidationUtils } from "@/lib/validation"

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, password, referralCode } = await request.json()

    // Input validation
    if (!name || !email || !phone || !password) {
      return NextResponse.json({ success: false, message: "Please fill in all fields" }, { status: 400 })
    }

    // Sanitize inputs
    const sanitizedName = ValidationUtils.sanitizeInput(name)
    const sanitizedEmail = ValidationUtils.sanitizeInput(email.toLowerCase())
    const sanitizedPhone = ValidationUtils.sanitizeInput(phone)

    // Validate inputs
    if (!ValidationUtils.isValidName(sanitizedName)) {
      return NextResponse.json(
        { success: false, message: "Name must be 2-50 characters and contain only letters and spaces" },
        { status: 400 },
      )
    }

    if (!ValidationUtils.isValidEmail(sanitizedEmail)) {
      return NextResponse.json({ success: false, message: "Please enter a valid email address" }, { status: 400 })
    }

    if (!ValidationUtils.isValidPhone(sanitizedPhone)) {
      return NextResponse.json({ success: false, message: "Please enter a valid phone number" }, { status: 400 })
    }

    const passwordValidation = ValidationUtils.isValidPassword(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json({ success: false, message: passwordValidation.message }, { status: 400 })
    }

    // Check if email already exists
    const existingUser = await DatabaseService.getUserByEmail(sanitizedEmail)
    if (existingUser) {
      return NextResponse.json({ success: false, message: "Email address is already registered" }, { status: 400 })
    }

    // Validate referral code if provided
    let referrer = null
    if (referralCode) {
      referrer = await DatabaseService.getUserByReferralCode(referralCode)
      if (!referrer) {
        return NextResponse.json({ success: false, message: "Invalid referral code" }, { status: 400 })
      }
    }

    // Hash password
    const hashedPassword = ValidationUtils.hashPassword(password)

    // Create user
    const newUser = await DatabaseService.createUser({
      email: sanitizedEmail,
      name: sanitizedName,
      phone: sanitizedPhone,
      password_hash: hashedPassword,
      referred_by: referralCode || undefined,
    })

    if (!newUser) {
      return NextResponse.json({ success: false, message: "Failed to create user account" }, { status: 500 })
    }

    // Create welcome notification
    await DatabaseService.createNotification({
      user_id: newUser.id,
      title: "Welcome to Abefe Social Hub!",
      message: "Your account has been created successfully. Start exploring our products and services.",
      type: "welcome",
    })

    return NextResponse.json({
      success: true,
      message: "Registration successful",
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        phone: newUser.phone,
        balance: newUser.balance,
        totalSpent: newUser.total_spent,
        totalPurchases: newUser.total_purchases,
        activeAccounts: newUser.active_accounts,
        referralCode: newUser.referral_code,
        referralEarnings: newUser.referral_earnings,
        memberSince: new Date(newUser.created_at).getFullYear().toString(),
        createdAt: newUser.created_at,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ success: false, message: "An error occurred during registration" }, { status: 500 })
  }
}
