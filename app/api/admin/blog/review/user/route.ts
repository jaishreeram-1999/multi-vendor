import { NextResponse } from "next/server"
import { User } from "@/models/User" // adjust path if needed
import {connectDB} from "@/lib/mongodb" // your DB connection utility

export async function GET() {
  try {
    await connectDB()

    const users = await User.find({})
      .select("-password") // 🔐 never send password
      .sort({ createdAt: -1 })

    return NextResponse.json({
      success: true,
      data: users,
    })
  } catch (error) {
    console.error("Error fetching users:", error)

    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 }
    )
  }
}
