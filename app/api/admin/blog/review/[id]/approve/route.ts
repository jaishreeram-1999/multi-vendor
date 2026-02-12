import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import { Review } from "@/models/blog/BlogReview"
import { connectDB } from "@/lib/mongodb"

// PATCH - Approve / Unapprove Review
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()

    const { id } = await context.params
    const body = await request.json()
    const { is_approved } = body

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid review ID" },
        { status: 400 }
      )
    }

    // Validate boolean
    if (typeof is_approved !== "boolean") {
      return NextResponse.json(
        { success: false, error: "is_approved must be a boolean" },
        { status: 400 }
      )
    }

    const review = await Review.findByIdAndUpdate(
      id,
      { is_approved },
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
        message: `Review ${is_approved ? "approved" : "unapproved"}`,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error approving review:", error)
    return NextResponse.json(
      { success: false, error: "Failed to approve review" },
      { status: 500 }
    )
  }
}
