import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database-service"

function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!isValidUUID(params.id)) {
      return NextResponse.json({ error: "Invalid notification ID format" }, { status: 400 })
    }

    await DatabaseService.markNotificationAsRead(params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating notification:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
