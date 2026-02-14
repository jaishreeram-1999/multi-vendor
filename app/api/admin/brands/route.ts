import { type NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Brand } from "@/models/Brand";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    
    // 1. Search Query ko URL se nikaalein
    const search = searchParams.get("search") || "";
    
    // 2. Filter banayein (Agar search hai to name check karein, warna empty filter)
    const filter = search 
      ? { name: { $regex: search, $options: "i" } } // 'i' ka matlab case-insensitive (A aur a same hai)
      : {};

    const skip = (page - 1) * limit;

    // 3. Filter ke saath search karein
    const brands = await Brand.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // 4. Sirf filtered brands ka total count nikaalein (Pagination ke liye)
    const total = await Brand.countDocuments(filter);

    return NextResponse.json({
      brands,
      total,
      totalPages: Math.ceil(total / limit),
      page,
      limit,
    });
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json(
      { error: "Failed to fetch brands" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const brand = new Brand(body);
    await brand.save();
    return NextResponse.json(brand, { status: 201 });
  } catch (error) {
    console.error("Error creating brand:", error);
    return NextResponse.json(
      { error: "Failed to create brand" },
      { status: 500 }
    );
  }
}
