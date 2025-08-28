import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database-service"

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const db = new DatabaseService()
    await db.clearUserNotifications(userId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error clearing notifications:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
