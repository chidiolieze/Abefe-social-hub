import { type NextRequest, NextResponse } from "next/server"
import Database from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    if (!process.env.PAYSTACK_SECRET_KEY) {
      console.error("PAYSTACK_SECRET_KEY environment variable is not set")
      return NextResponse.json(
        {
          error: "Payment service not configured. Please contact administrator.",
          details: "PAYSTACK_SECRET_KEY environment variable is missing",
        },
        { status: 503 },
      )
    }

    if (!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY) {
      console.error("NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY environment variable is not set")
      return NextResponse.json(
        {
          error: "Payment service not configured. Please contact administrator.",
          details: "NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY environment variable is missing",
        },
        { status: 503 },
      )
    }

    const { email, amount, userId, type, productId, productName } = await request.json()

    // Validate required fields
    if (!email || !amount || !userId || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate amount is a positive number
    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    // Generate unique reference
    const reference = `abefe_${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Initialize payment with Paystack
    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: Math.round(amount * 100), // Convert to kobo and ensure integer
        reference,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/payment/callback`,
        metadata: {
          userId,
          type, // 'wallet' or 'purchase'
          productId: productId || null,
          productName: productName || null,
        },
      }),
    })

    if (!paystackResponse.ok) {
      console.error("Paystack API error:", paystackResponse.status, paystackResponse.statusText)
      return NextResponse.json({ error: "Payment service unavailable" }, { status: 503 })
    }

    const paystackData = await paystackResponse.json()

    if (!paystackData.status) {
      console.error("Paystack initialization failed:", paystackData)
      return NextResponse.json(
        {
          error: paystackData.message || "Failed to initialize payment",
        },
        { status: 400 },
      )
    }

    // Store payment record in database
    try {
      Database.createPaymentRecord({
        reference,
        userId,
        email,
        amount,
        type,
        productId: productId || null,
        productName: productName || null,
        status: "pending",
        paystackData: paystackData.data,
      })
    } catch (dbError) {
      console.error("Database error while creating payment record:", dbError)
      // Continue with payment initialization even if database fails
    }

    return NextResponse.json({
      success: true,
      data: paystackData.data,
      publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
    })
  } catch (error) {
    console.error("Payment initialization error:", error)

    // Handle JSON parsing errors specifically
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid request format" }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
