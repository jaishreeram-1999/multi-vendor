import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Blog } from "@/models/blog/Blog"
import { getServerSession } from "next-auth/next" // getServerSession  from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    // ✅ Check admin auth
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const search = searchParams.get("search") || "" // ✅ added search param
    const skip = (page - 1) * limit

    // ✅ Build search query
    const query: any = {}
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ]
    }

    // ✅ Fetch blogs + total count
    const [blogs, total] = await Promise.all([
      Blog.find(query).sort({ created_at: -1 }).skip(skip).limit(limit).lean(),
      Blog.countDocuments(query),
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      blogs: blogs.map((blog: any) => ({
        ...blog,
        _id: blog._id.toString(),
        published: blog.is_published ?? false,
        publish_date: blog.published_at
          ? new Date(blog.published_at).toISOString()
          : null,
      })),
      pagination: { total, page, limit, totalPages },
    })
  } catch (error) {
    console.error("Error fetching blogs:", error)
    return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const data = await request.json()

    const required = ["title", "slug", "content", "excerpt", "featured_image", "author"] as const
    for (const f of required) {
      if (!data[f]) return NextResponse.json({ error: `${f} is required` }, { status: 400 })
    }

    const existing = await Blog.findOne({ slug: data.slug })
    if (existing) return NextResponse.json({ error: "Slug already exists" }, { status: 400 })

    const blog = await Blog.create({
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      featured_image: data.featured_image,
      author: data.author,
      categories: Array.isArray(data.categories) ? data.categories : [],
      tags: Array.isArray(data.tags) ? data.tags : [],
      is_published: data.published ?? true,
      published_at: data.publish_date ? new Date(data.publish_date) : new Date(),
      meta_title: data.meta_title || "",
      meta_description: data.meta_description || "",
    })

    return NextResponse.json({
      message: "Blog created successfully",
      blog: {
        ...blog.toObject(),
        _id: blog._id.toString(),
        published: blog.is_published ?? false,
        publish_date: blog.published_at ? new Date(blog.published_at).toISOString() : null,
      },
    })
  } catch (error) {
    console.error("Error creating blog:", error)
    return NextResponse.json({ error: "Failed to create blog" }, { status: 500 })
  }
}
