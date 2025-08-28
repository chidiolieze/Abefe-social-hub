import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database-service"

export async function GET(request: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const { orderId } = params

    const purchases = await DatabaseService.getUserPurchases("") // We'll get all purchases and filter
    const purchase = purchases.find((p) => p.id === orderId)

    if (!purchase) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const product = await DatabaseService.getProductById(purchase.product_id)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    let fileContent = `Product: ${product.name}\n\n`

    // Check if product has credentials
    const credentials = (product as any).credentials || {}
    let hasCredentials = false

    if (credentials.username) {
      fileContent += `Username: ${credentials.username}\n`
      hasCredentials = true
    }
    if (credentials.password) {
      fileContent += `Password: ${credentials.password}\n`
      hasCredentials = true
    }
    if (credentials.gmail) {
      fileContent += `Gmail: ${credentials.gmail}\n`
      hasCredentials = true
    }
    if (credentials.number) {
      fileContent += `Number: ${credentials.number}\n`
      hasCredentials = true
    }

    if (!hasCredentials) {
      return NextResponse.json(
        {
          error: "Credentials have not been set up for this product yet. Please contact support.",
        },
        { status: 404 },
      )
    }

    fileContent += `\nThank you for trusting Abefe SocialHub, until next time!`

    // Return the file as a download with proper headers
    return new NextResponse(fileContent, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="${product.name.replace(/[^a-zA-Z0-9]/g, "_")}_credentials.txt"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error) {
    console.error("Credential download error:", error)
    return NextResponse.json(
      {
        error: "Unable to generate credentials file. Please try again or contact support.",
      },
      { status: 500 },
    )
  }
}
