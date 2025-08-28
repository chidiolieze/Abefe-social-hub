import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database-service"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const product = await DatabaseService.getProductById(params.id)

    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updates = await request.json()

    const success = await DatabaseService.updateProduct(params.id, {
      name: updates.name,
      description: updates.description,
      price: Number(updates.price),
      category: updates.category,
      stock: Number(updates.stock),
      image_url: updates.image || null,
    })

    if (!success) {
      return NextResponse.json({ success: false, message: "Failed to update product" }, { status: 500 })
    }

    // Get updated product
    const updatedProduct = await DatabaseService.getProductById(params.id)
    return NextResponse.json({ success: true, product: updatedProduct })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ success: false, message: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const success = await DatabaseService.deleteProduct(params.id)

    if (!success) {
      return NextResponse.json({ success: false, message: "Failed to delete product" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Product deleted successfully" })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ success: false, message: "Failed to delete product" }, { status: 500 })
  }
}
