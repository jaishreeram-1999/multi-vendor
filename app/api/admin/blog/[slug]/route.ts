import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Blog } from "@/models/blog/Blog";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import path from "path";
import fs from "fs";


// =====================
// GET BLOG BY SLUG
// =====================
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    await connectDB();

    const { slug } = await params; // ✅ important

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const blog: any = await Blog.findOne({ slug }).lean();

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...blog,
      _id: blog._id.toString(),
      published: blog.is_published ?? false,
      publish_date: blog.published_at
        ? new Date(blog.published_at).toISOString().split("T")[0]
        : null,
    });
  } catch (error) {
    console.error("Error fetching blog:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog" },
      { status: 500 },
    );
  }
}

// =====================
// UPDATE BLOG
// =====================
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { slug } = await params; // ✅ important

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const data = await request.json();

    const required = [
      "title",
      "content",
      "excerpt",
      "featured_image",
      "author",
    ] as const;

    for (const field of required) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 },
        );
      }
    }

    // Check slug change
    if (data.slug && data.slug !== slug) {
      const exists = await Blog.findOne({ slug: data.slug });
      if (exists) {
        return NextResponse.json(
          { error: "Slug already exists" },
          { status: 400 },
        );
      }
    }

    const update: any = { ...data };

    if ("published" in update) {
      update.is_published = update.published;
      delete update.published;
    }

    if ("publish_date" in update) {
      update.published_at = update.publish_date
        ? new Date(update.publish_date)
        : undefined;
      delete update.publish_date;
    }

    const blog: any = await Blog.findOneAndUpdate({ slug }, update, {
      new: true,
    }).lean();

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Blog updated successfully",
      blog: {
        ...blog,
        _id: blog._id.toString(),
        published: blog.is_published ?? false,
        publish_date: blog.published_at
          ? new Date(blog.published_at).toISOString().split("T")[0]
          : null,
      },
    });
  } catch (error) {
    console.error("Error updating blog:", error);
    return NextResponse.json(
      { error: "Failed to update blog" },
      { status: 500 },
    );
  }
}

// =====================
// DELETE BLOG
// =====================
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { slug } = await params; // ✅ important

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const blog = await Blog.findOne({ slug });

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    // delete image from folder
    if (blog.featured_image) {
      const imagePath = path.join(process.cwd(), "public", blog.featured_image);

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // now delete blog
    await Blog.deleteOne({ slug });

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog:", error);
    return NextResponse.json(
      { error: "Failed to delete blog" },
      { status: 500 },
    );
  }
}
