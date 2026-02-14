import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Brand } from "@/models/Brand"

// Next.js 15/16 mein params Promise hota hai
type RouteParams = {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB()
    
    // params ko unwrap (await) karein
    const { id } = await params
    
    const brand = await Brand.findById(id)
    
    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 })
    }
    
    return NextResponse.json(brand)
  } catch (error) {
    console.error("GET Error:", error)
    return NextResponse.json({ error: "Failed to fetch brand" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB()
    
    // params ko unwrap (await) karein
    const { id } = await params
    const body = await request.json()
    
    const brand = await Brand.findByIdAndUpdate(id, body, { new: true })
    
    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 })
    }
    
    return NextResponse.json(brand)
  } catch (error) {
    console.error("PUT Error:", error)
    return NextResponse.json({ error: "Failed to update brand" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB()
    
    // params ko unwrap (await) karein
    const { id } = await params
    
    const brand = await Brand.findByIdAndDelete(id)
    
    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 })
    }
    
    return NextResponse.json({ message: "Brand deleted successfully" })
  } catch (error) {
    console.error("DELETE Error:", error)
    return NextResponse.json({ error: "Failed to delete brand" }, { status: 500 })
  }
}