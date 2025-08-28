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

    const transactions = await DatabaseService.getUserTransactions(userId)
    const purchases = await DatabaseService.getUserPurchases(userId)

    const completedTransactions = transactions.filter((t) => t.status === "completed")
    const activePurchases = purchases.filter((p) => p.status === "completed")

    const stats = {
      totalPurchases: purchases.length,
      activeAccounts: activePurchases.length,
      totalSpent: completedTransactions.reduce((sum, t) => sum + t.amount, 0),
      balance: user.balance,
      tickets: user.tickets || 0,
      referralEarnings: user.referral_earnings || 0,
      totalReferrals: 0, // TODO: Implement referral counting
      memberSince: new Date(user.created_at).getFullYear(),
      recentPurchases: purchases
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5),
      recentTransactions: completedTransactions
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5),
    }

    return NextResponse.json({ success: true, stats })
  } catch (error) {
    console.error("Error fetching user stats:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch user stats" }, { status: 500 })
  }
}
