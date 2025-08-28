import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database-service"
import { ValidationUtils } from "@/lib/validation"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID is required" }, { status: 400 })
    }

    const user = await DatabaseService.getUserById(userId)
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
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
    console.error("Get profile error:", error)
    return NextResponse.json({ success: false, message: "An error occurred while fetching profile" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, updates } = await request.json()

    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID is required" }, { status: 400 })
    }

    // Validate and sanitize updates
    const sanitizedUpdates: any = {}

    if (updates.name) {
      const sanitizedName = ValidationUtils.sanitizeInput(updates.name)
      if (!ValidationUtils.isValidName(sanitizedName)) {
        return NextResponse.json(
          { success: false, message: "Name must be 2-50 characters and contain only letters and spaces" },
          { status: 400 },
        )
      }
      sanitizedUpdates.name = sanitizedName
    }

    if (updates.email) {
      const sanitizedEmail = ValidationUtils.sanitizeInput(updates.email.toLowerCase())
      if (!ValidationUtils.isValidEmail(sanitizedEmail)) {
        return NextResponse.json({ success: false, message: "Please enter a valid email address" }, { status: 400 })
      }
      // Check if email is already taken by another user
      const existingUser = await DatabaseService.getUserByEmail(sanitizedEmail)
      if (existingUser && existingUser.id !== userId) {
        return NextResponse.json({ success: false, message: "Email address is already in use" }, { status: 400 })
      }
      sanitizedUpdates.email = sanitizedEmail
    }

    if (updates.phone) {
      const sanitizedPhone = ValidationUtils.sanitizeInput(updates.phone)
      if (!ValidationUtils.isValidPhone(sanitizedPhone)) {
        return NextResponse.json({ success: false, message: "Please enter a valid phone number" }, { status: 400 })
      }
      sanitizedUpdates.phone = sanitizedPhone
    }

    if (updates.password) {
      const passwordValidation = ValidationUtils.isValidPassword(updates.password)
      if (!passwordValidation.isValid) {
        return NextResponse.json({ success: false, message: passwordValidation.message }, { status: 400 })
      }
      sanitizedUpdates.password_hash = ValidationUtils.hashPassword(updates.password)
    }

    const success = await DatabaseService.updateUserProfile(userId, sanitizedUpdates)
    if (!success) {
      return NextResponse.json({ success: false, message: "Failed to update profile" }, { status: 500 })
    }

    // Get updated user data
    const updatedUser = await DatabaseService.getUserById(userId)
    if (!updatedUser) {
      return NextResponse.json({ success: false, message: "Failed to fetch updated profile" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        phone: updatedUser.phone,
        balance: updatedUser.balance,
        totalSpent: updatedUser.total_spent,
        totalPurchases: updatedUser.total_purchases,
        activeAccounts: updatedUser.active_accounts,
        referralCode: updatedUser.referral_code,
        referralEarnings: updatedUser.referral_earnings,
        memberSince: new Date(updatedUser.created_at).getFullYear().toString(),
        createdAt: updatedUser.created_at,
      },
    })
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json({ success: false, message: "An error occurred while updating profile" }, { status: 500 })
  }
}
