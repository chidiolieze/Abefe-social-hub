import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database-service"

export async function POST(request: NextRequest) {
  try {
    const { userId, productId, productName, productCategory, amount, transactionReference, proofOfPayment } =
      await request.json()

    if (!userId || !productId || !productName || !amount || !transactionReference) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    // Create manual payment request as a pending transaction
    const manualPayment = await DatabaseService.createTransaction({
      user_id: userId,
      type: "manual_payment_request",
      amount: amount,
      description: `Manual payment request for ${productName} - Ref: ${transactionReference}`,
      paystack_reference: transactionReference,
      status: "pending",
    })

    if (!manualPayment) {
      return NextResponse.json({ success: false, message: "Failed to create manual payment request" }, { status: 500 })
    }

    // Create notification for admin
    await DatabaseService.createNotification({
      user_id: "admin", // Admin notification
      title: "New Manual Payment Request",
      message: `User has submitted a manual payment request for ${productName} (₦${amount.toLocaleString()})`,
      type: "info",
      is_read: false,
      action_url: "/admin",
    })

    // Create notification for user
    await DatabaseService.createNotification({
      user_id: userId,
      title: "Manual Payment Submitted",
      message: `Your manual payment request for ${productName} has been submitted and is pending approval`,
      type: "info",
      is_read: false,
      action_url: "/dashboard",
    })

    return NextResponse.json({
      success: true,
      message: "Manual payment request submitted successfully",
      manualPayment,
    })
  } catch (error) {
    console.error("Error creating manual payment request:", error)
    return NextResponse.json({ success: false, message: "Failed to create manual payment request" }, { status: 500 })
  }
}
