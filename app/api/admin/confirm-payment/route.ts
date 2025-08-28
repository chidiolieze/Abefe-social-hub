import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database-service"

export async function POST(request: NextRequest) {
  try {
    const { userId, amount, description, adminNotes } = await request.json()

    if (!userId || !amount) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    const db = new DatabaseService()

    const user = await db.getUser(userId)
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    const balanceUpdated = await db.updateUserBalance(userId, Number(amount))

    if (!balanceUpdated) {
      return NextResponse.json({ success: false, message: "Failed to update user balance" }, { status: 500 })
    }

    const transactionId = `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const transaction = await db.createTransaction({
      id: transactionId,
      user_id: userId,
      type: "manual_confirmation",
      amount: Number(amount),
      description: description || "Manual payment confirmation by admin",
      status: "completed",
      reference: `admin-confirm-${Date.now()}`,
    })

    const notificationId = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    await db.createNotification({
      id: notificationId,
      user_id: userId,
      title: "Payment Confirmed",
      message: `Your payment of ₦${Number(amount).toLocaleString()} has been confirmed by admin and added to your wallet.`,
      type: "payment",
      read: false,
    })

    const updatedUser = await db.getUser(userId)
    const newBalance = updatedUser?.wallet_balance || 0

    return NextResponse.json({
      success: true,
      message: "Payment confirmed successfully",
      transaction,
      newBalance,
    })
  } catch (error) {
    console.error("Error confirming payment:", error)
    return NextResponse.json({ success: false, message: "Failed to confirm payment" }, { status: 500 })
  }
}
