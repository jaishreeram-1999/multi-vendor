import mongoose, { Schema, type Document } from "mongoose"
import "@/models/blog/Blog"
import "@/models/User"

// Review Interface
export interface IReview extends Document {
  _id: mongoose.Types.ObjectId
  blog_id: mongoose.Types.ObjectId
  user_id: mongoose.Types.ObjectId
  rating: number
  title: string
  content: string
  author_name: string
  author_email: string
  is_approved: boolean
  is_featured: boolean
  helpful_count: number
  unhelpful_count: number
  created_at: Date
  updated_at: Date
}

const ReviewSchema = new Schema<IReview>(
  {
    blog_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    author_name: {
      type: String,
      required: true,
    },
    author_email: {
      type: String,
      required: true,
    },
    is_approved: {
      type: Boolean,
      default: false,
    },
    is_featured: {
      type: Boolean,
      default: false,
    },
    helpful_count: {
      type: Number,
      default: 0,
    },
    unhelpful_count: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
)

export const Review =
  mongoose.models.Review || mongoose.model<IReview>("BlogReview", ReviewSchema)
