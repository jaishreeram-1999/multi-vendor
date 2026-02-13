import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Category } from "@/models/Category";
import { CategoryFormData } from "@/types/category.types";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const order = searchParams.get("order") === "asc" ? 1 : -1;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
    
    // New filter parameters
    const search = searchParams.get("search") || "";
    const level = searchParams.get("level");
    const isActive = searchParams.get("isActive");

    // Build filter object
    const filter: any = {};

    // Search across name, description, and slug
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by level
    if (level !== null && level !== undefined && level !== "") {
      filter.level = parseInt(level);
    }

    // Filter by status
    if (isActive !== null && isActive !== undefined && isActive !== "") {
      filter.isActive = isActive === "true";
    }

    const categories = await Category.find(filter)
      .sort({ [sortBy]: order })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    const total = await Category.countDocuments(filter).exec();

    return NextResponse.json(
      {
        success: true,
        data: categories,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[CATEGORIES_GET]", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body: CategoryFormData = await request.json();

    const {
      name,
      description,
      image,
      parentId: rawParentId,
      metaTitle,
      metaDescription,
      sortOrder,
      isActive,
    } = body;

    // then if you need to transform parentId:
    const parentId =
      !rawParentId ||
      rawParentId === "none" ||
      rawParentId === "null" ||
      rawParentId === "undefined" ||
      rawParentId === ""
        ? null
        : rawParentId;

    // Validation
    if (!name || name.trim() === "") {
      return NextResponse.json(
        { success: false, message: "Category name is required" },
        { status: 400 },
      );
    }

    if (name.length < 3) {
      return NextResponse.json(
        {
          success: false,
          message: "Category name must be at least 3 characters",
        },
        { status: 400 },
      );
    }

    // 🟢 Parent ID Validation Gate
    if (parentId) {
      // mongoose.isValidObjectId() use karna sabse safe hai
      if (!mongoose.isValidObjectId(parentId)) {
        return NextResponse.json(
          { success: false, message: "Invalid Parent Category ID format" },
          { status: 400 },
        );
      }

      const parentExists = await Category.findById(parentId);
      if (!parentExists) {
        return NextResponse.json(
          { success: false, message: "Parent category not found" },
          { status: 404 },
        );
      }
    }

    // Save Category
    const category = new Category({
      name,
      description: description || "",
      image: image || "",
      parentId: parentId,
      metaTitle: metaTitle || "",
      metaDescription: metaDescription || "",
      sortOrder: sortOrder || 0,
      isActive: isActive !== false,
    });

    await category.save();

    return NextResponse.json(
      {
        success: true,
        data: category,
        message: "Category created successfully",
      },
      { status: 201 },
    );
  } catch (err: unknown) {
    // Check if it's a Mongoose duplicate key error
    console.error("[CATEGORIES_POST]", err);

    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code?: number }).code === 11000
    ) {
      return NextResponse.json(
        { success: false, message: "Category already exists" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Failed to create",
      },
      { status: 500 },
    );
  }
}
