import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Brand } from "@/models/Brand"
import fs from "fs";
import path from "path";


// Next.js 15/16 mein params Promise hota hai
type RouteParams = {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB()
    
    // params ko unwrap (await) karein
    const { id } = await params
    
    const brand = await Brand.findById(id)
    
    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 })
    }
    
    return NextResponse.json(brand)
  } catch (error) {
    console.error("GET Error:", error)
    return NextResponse.json({ error: "Failed to fetch brand" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await request.json();

    const existingBrand = await Brand.findById(id);

    if (!existingBrand) {
      return NextResponse.json(
        { error: "Brand not found" },
        { status: 404 }
      );
    }

    // 🔥 If new image coming & old image exists → delete old image
    if (body.icon && existingBrand.icon && body.icon !== existingBrand.icon) {
      const imagePath = path.join(
        process.cwd(),
        "public",
        existingBrand.icon.replace(/^\/+/, "")
      );

      try {
        await fs.promises.unlink(imagePath);
      } catch (err) {
        console.error("Old image delete error:", err);
      }
    }

    const updatedBrand = await Brand.findByIdAndUpdate(
      id,
      body,
      { returnDocument: "after" }
    );

    return NextResponse.json(updatedBrand);

  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json(
      { error: "Failed to update brand" },
      { status: 500 }
    );
  }
}


export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    await connectDB();

    const { id } = await params;

    const brand = await Brand.findById(id);

    if (!brand) {
      return NextResponse.json(
        { error: "Brand not found" },
        { status: 404 }
      );
    }

    // 🔥 Delete image file
    if (brand.icon) {
      const imagePath = path.join(
        process.cwd(),
        "public",
        brand.icon
      );

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Delete brand from DB
    await Brand.findByIdAndDelete(id);

    return NextResponse.json({
      message: "Brand deleted successfully",
    });

  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json(
      { error: "Failed to delete brand" },
      { status: 500 }
    );
  }
}
