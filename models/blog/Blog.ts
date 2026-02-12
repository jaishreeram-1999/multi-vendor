import mongoose, { Schema, type Document } from "mongoose"
import "@/models/blog/BlogCategory";
export interface IBlog extends Document {
  title: string
  slug: string
  content: string
  excerpt: string
  featured_image: string
  author: string
  categories: string
  tags: string[]
  published_at: Date
  is_published: boolean
  meta_title: string
  meta_description: string
  created_at: Date
  updated_at: Date
}

const BlogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    excerpt: { type: String, required: true },
    featured_image: { type: String, required: true },
    author: { type: String, required: true },
     categories: [{ type: String }],
    tags: [{ type: String }],
    published_at: { type: Date },
    is_published: { type: Boolean, default: false },
    meta_title: { type: String },
    meta_description: { type: String },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
)

export const Blog = mongoose.models.Blog || mongoose.model<IBlog>("Blog", BlogSchema)
