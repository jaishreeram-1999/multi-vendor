import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/User"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    await connectDB()

  const { name, email, password } = await request.json()
if (!name || !email || !password) {
  return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
}

    // Check if user already exists
    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: "user",
    })

    await user.save()

    return NextResponse.json({ message: "User registered successfully" })
  } catch (error) {
    console.error("Error registering user:", error)
    return NextResponse.json({ error: "Failed to register user" }, { status: 500 })
  }
}
