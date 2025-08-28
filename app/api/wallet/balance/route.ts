import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database-service"

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
      balance: user.balance,
      totalSpent: user.total_spent,
      totalPurchases: user.total_purchases,
    })
  } catch (error) {
    console.error("Error fetching wallet balance:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch wallet balance" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, amount } = await request.json()

    if (!userId || typeof amount !== "number") {
      return NextResponse.json({ success: false, message: "Invalid request data" }, { status: 400 })
    }

    const success = await DatabaseService.updateUserBalance(userId, amount)
    if (!success) {
      return NextResponse.json({ success: false, message: "Failed to update balance" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Balance updated successfully" })
  } catch (error) {
    console.error("Error updating wallet balance:", error)
    return NextResponse.json({ success: false, message: "Failed to update wallet balance" }, { status: 500 })
  }
}
