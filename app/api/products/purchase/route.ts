import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database-service"

export async function POST(request: NextRequest) {
  try {
    const { productId, userId, quantity = 1 } = await request.json()

    if (!productId || !userId) {
      return NextResponse.json({ error: "Product ID and User ID are required" }, { status: 400 })
    }

    const db = new DatabaseService()

    // Get product details
    const product = await db.getProduct(productId)
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Check stock
    if (product.stock < quantity) {
      return NextResponse.json({ error: "Insufficient stock" }, { status: 400 })
    }

    // Get user details
    const user = await db.getUser(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const totalAmount = product.price * quantity

    // Check wallet balance
    if (user.wallet_balance < totalAmount) {
      return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 400 })
    }

    // Process purchase
    const purchaseId = `purchase-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Deduct from wallet and update stock
    await db.updateUserBalance(userId, -totalAmount)
    await db.updateProductStock(productId, -quantity)

    // Create purchase record
    await db.createPurchase({
      id: purchaseId,
      user_id: userId,
      product_id: productId,
      quantity,
      total_amount: totalAmount,
      status: "completed",
    })

    const credentials = product.credentials || {}
    let txtContent = ""

    if (credentials.username) txtContent += `Username: ${credentials.username}\n`
    if (credentials.password) txtContent += `Password: ${credentials.password}\n`
    if (credentials.gmail) txtContent += `Gmail: ${credentials.gmail}\n`
    if (credentials.number) txtContent += `Number: ${credentials.number}\n`

    // Create transaction record
    await db.createTransaction({
      id: `txn-${Date.now()}`,
      user_id: userId,
      type: "purchase",
      amount: totalAmount,
      description: `Purchase: ${product.name}`,
      status: "completed",
      reference: purchaseId,
    })

    return NextResponse.json({
      success: true,
      purchaseId,
      txtContent: txtContent.trim(),
      message: "Purchase completed successfully",
    })
  } catch (error) {
    console.error("Purchase error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
