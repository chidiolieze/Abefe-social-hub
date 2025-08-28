import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database-service"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const reference = url.searchParams.get("reference")

    if (!reference) {
      return NextResponse.json({ error: "Reference is required" }, { status: 400 })
    }

    if (!process.env.PAYSTACK_SECRET_KEY) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment service not configured",
        },
        { status: 503 },
      )
    }

    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    })

    const paystackData = await paystackResponse.json()

    if (!paystackData.status || paystackData.data.status !== "success") {
      return NextResponse.json(
        {
          success: false,
          message: "Payment verification failed",
        },
        { status: 400 },
      )
    }

    const existingTransactions = await DatabaseService.getUserTransactions(paystackData.data.metadata.userId)
    const existingTransaction = existingTransactions.find((t) => t.paystack_reference === reference)

    if (existingTransaction) {
      return NextResponse.json({
        success: true,
        message: "Payment already processed",
        data: existingTransaction,
      })
    }

    const { userId, type, productId, productName } = paystackData.data.metadata
    const amountInNaira = paystackData.data.amount / 100

    if (type === "wallet") {
      const user = await DatabaseService.getUserById(userId)
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      const newBalance = user.balance + amountInNaira
      await DatabaseService.updateUserBalance(userId, newBalance)

      await DatabaseService.createTransaction({
        user_id: userId,
        type: "wallet_fund",
        amount: amountInNaira,
        description: "Wallet Funding via Paystack",
        paystack_reference: reference,
        status: "completed",
      })

      await DatabaseService.createNotification({
        user_id: userId,
        title: "Wallet Funded Successfully",
        message: `Your wallet has been funded with ₦${amountInNaira.toLocaleString()}`,
        type: "payment",
      })
    } else if (type === "purchase") {
      const user = await DatabaseService.getUserById(userId)
      const product = await DatabaseService.getProductById(productId)

      if (!user || !product) {
        return NextResponse.json({ error: "User or product not found" }, { status: 404 })
      }

      const newStock = Math.max(0, product.stock - 1)
      await DatabaseService.updateProduct(productId, { stock: newStock })

      await DatabaseService.createPurchase({
        user_id: userId,
        product_id: productId,
        product_name: productName,
        amount: amountInNaira,
        quantity: 1,
        paystack_reference: reference,
        status: "completed",
      })

      await DatabaseService.createTransaction({
        user_id: userId,
        type: "product_purchase",
        amount: amountInNaira,
        description: `Purchase: ${productName}`,
        paystack_reference: reference,
        status: "completed",
      })

      await DatabaseService.updateUserProfile(userId, {
        total_spent: user.total_spent + amountInNaira,
        total_purchases: user.total_purchases + 1,
        active_accounts: user.active_accounts + 1,
      })

      await DatabaseService.createNotification({
        user_id: userId,
        title: "Purchase Completed",
        message: `You have successfully purchased ${productName} for ₦${amountInNaira.toLocaleString()}`,
        type: "purchase",
        action_url: "/orders",
      })
    }

    return NextResponse.json({
      success: true,
      message: type === "wallet" ? "Wallet funded successfully" : "Purchase completed successfully",
      data: { reference, amount: amountInNaira, type },
    })
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
