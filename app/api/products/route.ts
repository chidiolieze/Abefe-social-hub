import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database-service"

export async function GET() {
  try {
    const products = await DatabaseService.getAllProducts()
    return NextResponse.json({ success: true, products })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const productData = await request.json()

    // Validate required fields
    if (!productData.name || !productData.description || !productData.category || !productData.price) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    // Create product with proper structure
    const newProduct = await DatabaseService.createProduct({
      id: productData.id || `product-${Date.now()}`,
      name: productData.name,
      description: productData.description,
      price: Number(productData.price),
      category: productData.category,
      stock: Number(productData.stock) || 0,
      image_url: productData.image || null,
    })

    if (!newProduct) {
      return NextResponse.json({ success: false, message: "Failed to create product" }, { status: 500 })
    }

    return NextResponse.json({ success: true, product: newProduct })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ success: false, message: "Failed to create product" }, { status: 500 })
  }
}
