import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import { Review } from "@/models/blog/BlogReview"
import { connectDB } from "@/lib/mongodb"

// POST - Toggle helpful/unhelpful count
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()

    const { id } = await context.params
    const body = await request.json()
    const { type } = body // "helpful" or "unhelpful"

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid review ID" },
        { status: 400 }
      )
    }

    // Validate type
    if (type !== "helpful" && type !== "unhelpful") {
      return NextResponse.json(
        { success: false, error: "Invalid type. Use 'helpful' or 'unhelpful'" },
        { status: 400 }
      )
    }

    // Increment field dynamically
    const updateObj =
      type === "helpful"
        ? { helpful_count: 1 }
        : { unhelpful_count: 1 }

    const review = await Review.findByIdAndUpdate(
      id,
      { $inc: updateObj },
      { new: true }
    )

    if (!review) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: review,
        message: `Review marked as ${type}`,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error updating helpful count:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update helpful count" },
      { status: 500 }
    )
  }
}
