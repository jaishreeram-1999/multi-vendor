import { NextRequest, NextResponse } from "next/server";
import { BlogCategory } from "@/models/blog/BlogCategory";
import {connectDB} from "@/lib/mongodb";

export async function GET() {
  try {
    await connectDB();
    const blogcategories = await BlogCategory.find({}).sort({ name: 1 }).lean();

    // Wrap array in an object
    return NextResponse.json({ blogcategories });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    
    const { name, description, isActive = true } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const existing = await BlogCategory.findOne({ name: name.trim() });
    if (existing) {
      return NextResponse.json({ error: "Category name already exists" }, { status: 400 });
    }

    const category = await BlogCategory.create({
      name: name.trim(),
      description: description?.trim() || "",
      isActive: !!isActive,
      slug: name.trim().replace(/\s+/g, "-").toLowerCase(),
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error.message || "Failed to create category" },
      { status: 500 }
    );
  }
}