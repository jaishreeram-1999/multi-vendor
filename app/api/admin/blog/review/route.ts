import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Review } from "@/models/blog/BlogReview"
import mongoose from "mongoose"

// GET - Fetch all reviews with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const blogId = searchParams.get("blog_id")
    const userId = searchParams.get("user_id")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const approved = searchParams.get("approved")
    const search = searchParams.get("search")

    const skip = (page - 1) * limit

    // Build filter object
    const filter: any = {}
    if (blogId) filter.blog_id = new mongoose.Types.ObjectId(blogId)
    if (userId) filter.user_id = new mongoose.Types.ObjectId(userId)
    if (approved !== null) filter.is_approved = approved === "true"

    // Add search filter - searches across multiple fields
    if (search) {
      const searchRegex = { $regex: search, $options: "i" } // case-insensitive regex
      filter.$or = [
        { title: searchRegex },
        { content: searchRegex },
        { author_name: searchRegex },
        { author_email: searchRegex },
        { "blog_id.title": searchRegex },
      ]
    }

    // Get total count
    const total = await Review.countDocuments(filter)

    // Fetch reviews with pagination
    const reviews = await Review.find(filter)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .populate("blog_id", "title slug")
      .populate("user_id", "name email")

    return NextResponse.json(
      {
        success: true,
        data: reviews,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch reviews" },
      { status: 500 },
    )
  }
}

// POST - Create a new review
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const {
      blog_id,
      user_id,
      rating,
      title,
      content,
      author_name,
      author_email,
      is_approved,
      is_featured,
    } = body

    // Validation
    if (!blog_id || !rating || !title || !content || !author_name || !author_email) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: "Rating must be between 1 and 5" },
        { status: 400 },
      )
    }

    // Create new review
    const review = new Review({
      blog_id: new mongoose.Types.ObjectId(blog_id),
      user_id: user_id ? new mongoose.Types.ObjectId(user_id) : null,
      rating,
      title,
      content,
      author_name,
      author_email,
      is_approved: is_approved || false,
      is_featured: is_featured || false,
    })

    await review.save()

    return NextResponse.json(
      { success: true, data: review, message: "Review created successfully" },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating review:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create review" },
      { status: 500 },
    )
  }
}
