import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import { connectDB } from "@/lib/mongodb"
import { Review } from "@/models/blog/BlogReview"

// ==============================
// GET - Fetch Single Review
// ==============================
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()

    const { id } = await context.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid review ID" },
        { status: 400 }
      )
    }

    const review = await Review.findById(id)
      .populate("blog_id", "title slug content")
      .populate("user_id", "name email")

    if (!review) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: true, data: review },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error fetching review:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch review" },
      { status: 500 }
    )
  }
}

// ==============================
// PUT - Update Review
// ==============================
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()

    const { id } = await context.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid review ID" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      rating,
      title,
      content,
      author_name,
      author_email,
      is_approved,
      is_featured,
    } = body

    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { success: false, error: "Rating must be between 1 and 5" },
        { status: 400 }
      )
    }

    const review = await Review.findByIdAndUpdate(
      id,
      {
        ...(rating !== undefined && { rating }),
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(author_name !== undefined && { author_name }),
        ...(author_email !== undefined && { author_email }),
        ...(is_approved !== undefined && { is_approved }),
        ...(is_featured !== undefined && { is_featured }),
      },
      { new: true }
    )
      .populate("blog_id", "title slug")
      .populate("user_id", "name email")

    if (!review) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: true, data: review, message: "Review updated successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error updating review:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update review" },
      { status: 500 }
    )
  }
}

// ==============================
// DELETE - Delete Review
// ==============================
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()

    const { id } = await context.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid review ID" },
        { status: 400 }
      )
    }

    const review = await Review.findByIdAndDelete(id)

    if (!review) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: true, message: "Review deleted successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error deleting review:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete review" },
      { status: 500 }
    )
  }
}
