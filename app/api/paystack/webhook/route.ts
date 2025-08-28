import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import Database from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-paystack-signature")

    if (!signature) {
      return NextResponse.json({ error: "No signature provided" }, { status: 400 })
    }

    // Verify webhook signature
    const hash = crypto.createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!).update(body).digest("hex")

    if (hash !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const event = JSON.parse(body)

    // Handle successful payment
    if (event.event === "charge.success") {
      const { reference, status, amount } = event.data

      if (status === "success") {
        // Get payment record
        const paymentRecord = Database.getPaymentRecord(reference)

        if (paymentRecord && paymentRecord.status === "pending") {
          const { userId, type, productId, productName } = paymentRecord
          const amountInNaira = amount / 100 // Convert from kobo

          if (type === "wallet") {
            Database.updateUserBalance(userId, amountInNaira)
            Database.createTransaction({
              userId,
              type: "wallet_funding",
              amount: amountInNaira,
              description: `Wallet funded via Paystack webhook - ${reference}`,
              reference,
              status: "completed",
            })
          } else if (type === "purchase") {
            const user = Database.getUserById(userId)
            if (user) {
              Database.createPurchase({
                userId,
                productId: productId!,
                productName: productName!,
                amount: amountInNaira,
                paymentMethod: "paystack",
                reference,
                status: "completed",
              })

              Database.updateUserStats(userId, {
                totalSpent: user.totalSpent + amountInNaira,
                totalPurchases: user.totalPurchases + 1,
                activeAccounts: user.activeAccounts + 1,
              })

              Database.decrementProductStock(productId!)
            }
          }

          // Update payment record
          Database.updatePaymentRecord(reference, {
            status: "completed",
            webhookData: event.data,
          })
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
