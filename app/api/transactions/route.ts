import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database-service"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID is required" }, { status: 400 })
    }

    const transactions = await DatabaseService.getUserTransactions(userId)
    return NextResponse.json({ success: true, transactions })
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch transactions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const transactionData = await request.json()

    const transaction = await DatabaseService.createTransaction({
      user_id: transactionData.userId,
      type: transactionData.type,
      amount: transactionData.amount,
      description: transactionData.description,
      paystack_reference: transactionData.reference,
      status: transactionData.status || "completed",
    })

    if (!transaction) {
      return NextResponse.json({ success: false, message: "Failed to create transaction" }, { status: 500 })
    }

    return NextResponse.json({ success: true, transaction })
  } catch (error) {
    console.error("Error creating transaction:", error)
    return NextResponse.json({ success: false, message: "Failed to create transaction" }, { status: 500 })
  }
}
