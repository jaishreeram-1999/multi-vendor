import { connectDB } from "@/lib/mongodb";
import { Category } from "@/models/Category";
import { CategoryFormData } from "@/types/category.types";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID is required" },
        { status: 400 }
      );
    }

    const category = await Category.findById(id).lean();

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: category },
      { status: 200 }
    );
  } catch (error) {
    console.error("[CATEGORY_GET]", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body: Partial<CategoryFormData> = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID is required" },
        { status: 400 }
      );
    }

    // Validation
    if (body.name && body.name.length < 3) {
      return NextResponse.json(
        { success: false, message: "Category name must be at least 3 characters" },
        { status: 400 }
      );
    }

    // Validate parent category exists and is not self
    if (body.parentId) {
      if (body.parentId === id) {
        return NextResponse.json(
          { success: false, message: "Category cannot be its own parent" },
          { status: 400 }
        );
      }

      const parentExists = await Category.findById(body.parentId);
      if (!parentExists) {
        return NextResponse.json(
          { success: false, message: "Parent category not found" },
          { status: 404 }
        );
      }
    }

    const category = await Category.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: category,
        message: "Category updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[CATEGORY_PUT]", error);
    return NextResponse.json(
      { success: false, message: "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID is required" },
        { status: 400 }
      );
    }

    // Verify category exists first
    const category = await Category.findById(id);

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    // Check if category has children using type assertion
    const childCount = await Category.countDocuments({
      parentId: new mongoose.Types.ObjectId(id),
    } as any);

    if (childCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot delete this category because it contains ${childCount} subcategor${childCount > 1 ? "ies" : "y"}. Please delete or move all subcategories first.`,
        },
        { status: 400 }
      );
    }

    // Perform deletion
    await Category.findByIdAndDelete(id);

    return NextResponse.json(
      {
        success: true,
        message: "Category deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[CATEGORY_DELETE]", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete category" },
      { status: 500 }
    );
  }
}
