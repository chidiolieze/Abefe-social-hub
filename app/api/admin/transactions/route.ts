import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"

export async function GET() {
  try {
    const { data: transactions, error } = await supabase
      .from("transactions")
      .select(`
        *,
        users (
          name,
          email
        )
      `)
      .order("created_at", { ascending: false })
      .limit(100)

    if (error) throw error

    return NextResponse.json({ success: true, transactions })
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch transactions" }, { status: 500 })
  }
}
