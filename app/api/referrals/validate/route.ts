import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database-service"

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("code")

    if (!code) {
      return NextResponse.json({ success: false, message: "Referral code is required" }, { status: 400 })
    }

    const referrer = await DatabaseService.getUserByReferralCode(code)

    return NextResponse.json({
      success: true,
      valid: !!referrer,
      referrer: referrer ? { name: referrer.name, id: referrer.id } : null,
    })
  } catch (error) {
    console.error("Error validating referral code:", error)
    return NextResponse.json({ success: false, message: "Failed to validate referral code" }, { status: 500 })
  }
}
