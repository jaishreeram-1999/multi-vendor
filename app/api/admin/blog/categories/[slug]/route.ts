import { NextRequest, NextResponse } from "next/server";
import { BlogCategory } from "@/models/blog/BlogCategory";
import { connectDB } from "@/lib/mongodb";

// Helper to get slug from the request URL
function getSlugFromRequest(req: NextRequest) {
  const url = new URL(req.url);
  return url.pathname.split("/").pop(); // last part of path
}

// GET single category by slug
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const slug = getSlugFromRequest(req);
    if (!slug) return NextResponse.json({ error: "Slug not found" }, { status: 400 });

    const category = await BlogCategory.findOne({ slug }).lean();
    if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });

    return NextResponse.json({ category }); // wrap in object
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH update category by slug
export async function PATCH(req: NextRequest) {
  try {
    await connectDB();

    const slug = getSlugFromRequest(req);
    if (!slug) return NextResponse.json({ error: "Slug not found" }, { status: 400 });

    const body = await req.json();
    const { name, description, isActive } = body;

    if (!name && description === undefined && isActive === undefined) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const updateData: any = {};
    if (name?.trim()) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() ?? "";
    if (isActive !== undefined) updateData.isActive = !!isActive;

    const updated = await BlogCategory.findOneAndUpdate(
      { slug },
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) return NextResponse.json({ error: "Category not found" }, { status: 404 });

    return NextResponse.json({ category: updated });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || "Failed to update" }, { status: 500 });
  }
}

// DELETE category by slug
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    const slug = getSlugFromRequest(req);
    if (!slug) return NextResponse.json({ error: "Slug not found" }, { status: 400 });

    const deleted = await BlogCategory.findOneAndDelete({ slug });
    if (!deleted) return NextResponse.json({ error: "Category not found" }, { status: 404 });

    return NextResponse.json({ message: "Category deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
