import { connectDB } from "@/lib/mongodb";
import { Category } from "@/models/Category";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { CategoryFormData } from "@/lib/schemas/category.schema";
import fs from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID is required" },
        { status: 400 },
      );
    }

    const category = await Category.findById(id).lean();

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, data: category },
      { status: 200 },
    );
  } catch (error) {
    console.error("[CATEGORY_GET]", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch category" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;
    const body: Partial<CategoryFormData> = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID is required" },
        { status: 400 },
      );
    }

    // Validation (same as before)
    if (body.name && body.name.length < 3) {
      return NextResponse.json(
        {
          success: false,
          message: "Category name must be at least 3 characters",
        },
        { status: 400 },
      );
    }

    if (body.parentId) {
      if (body.parentId === id) {
        return NextResponse.json(
          { success: false, message: "Category cannot be its own parent" },
          { status: 400 },
        );
      }
      const parentExists = await Category.findById(body.parentId);
      if (!parentExists) {
        return NextResponse.json(
          { success: false, message: "Parent category not found" },
          { status: 404 },
        );
      }
    }

    // ───────────────━ Image handling (sirf yeh naya part add kar rahe hain) ───────────────
    let oldImageToDelete: string | null = null;

    // Purani image check karo (sirf image field fetch kar rahe hain)
    const existing = await Category.findById(id).select("image");

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 },
      );
    }

    // Agar naya image path aaya aur purane se alag hai → purani delete
    if (body.image && typeof body.image === "string" && body.image.trim() !== "") {
      if (existing.image && existing.image !== body.image) {
        oldImageToDelete = existing.image;
      }
    }

    // Agar image null ya empty string bheja → purani delete + DB mein clear
    else if (body.image === null || body.image === "") {
      if (existing.image) {
        oldImageToDelete = existing.image;
        body.image = null; // DB clear
      }
    }

    // ───────────────━ Update (same as before, bas naam change kiya clarity ke liye) ───────────────
    const updatedCategory = await Category.findByIdAndUpdate(id, body, {
      returnDocument: 'after',
      runValidators: true,
    });

    // ───────────────━ Purani image delete (safe tareeke se) ───────────────
    if (oldImageToDelete) {
      const imagePath = path.join(
        process.cwd(),
        "public",
        oldImageToDelete.replace(/^\/+/, "")
      );

      try {
        await fs.promises.unlink(imagePath);
        console.log(`Old image deleted: ${oldImageToDelete}`);
      } catch (err) {
        console.error("Old image delete failed:", err);
        // API fail nahi karenge
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: updatedCategory,
        message: "Category updated successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[CATEGORY_PUT]", error);
    return NextResponse.json(
      { success: false, message: "Failed to update category" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID is required" },
        { status: 400 },
      );
    }

    // Verify category exists first
    const category = await Category.findById(id);

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 },
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
        { status: 400 },
      );
    }

    // Delete image if exists
    if (category.image) {
      const imagePath = path.join(process.cwd(), "public", category.image);

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Perform deletion
    await Category.findByIdAndDelete(id);

    return NextResponse.json(
      {
        success: true,
        message: "Category deleted successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[CATEGORY_DELETE]", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete category" },
      { status: 500 },
    );
  }
}
