import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database-service"

export async function POST(request: NextRequest) {
  try {
    const { userId, amount, transactionReference, proofOfPayment } = await request.json()

    if (!userId || !amount || !transactionReference) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    // Create funding request in database
    const fundingRequest = await DatabaseService.createTransaction({
      user_id: userId,
      type: "funding_request",
      amount: amount,
      description: `Manual funding request - Ref: ${transactionReference}`,
      paystack_reference: transactionReference,
      status: "pending",
    })

    if (!fundingRequest) {
      return NextResponse.json({ success: false, message: "Failed to create funding request" }, { status: 500 })
    }

    // Create notification for admin
    await DatabaseService.createNotification({
      user_id: "admin", // Admin notification
      title: "New Funding Request",
      message: `User has submitted a funding request for ₦${amount.toLocaleString()}`,
      type: "info",
      is_read: false,
      action_url: "/admin",
    })

    // Create notification for user
    await DatabaseService.createNotification({
      user_id: userId,
      title: "Funding Request Submitted",
      message: `Your funding request for ₦${amount.toLocaleString()} has been submitted and is pending approval`,
      type: "info",
      is_read: false,
      action_url: "/dashboard",
    })

    return NextResponse.json({
      success: true,
      message: "Funding request submitted successfully",
      fundingRequest,
    })
  } catch (error) {
    console.error("Error creating funding request:", error)
    return NextResponse.json({ success: false, message: "Failed to create funding request" }, { status: 500 })
  }
}
