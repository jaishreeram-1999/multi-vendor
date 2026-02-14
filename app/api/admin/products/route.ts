import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Product } from "@/models/Product"

// =================== GET PRODUCTS ===================
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1", 10)
    const limit = Number.parseInt(searchParams.get("per_page") || "10", 10)
    const skip = (page - 1) * limit

    const [products, total] = await Promise.all([
      Product.find()
        .populate("category", "name")
        .populate("subcategory", "name")
        .populate("brand", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(),
    ])

    const totalPages = Math.ceil(total / limit)
    const allProducts = await Product.find();

    return NextResponse.json({
      products,
      allProducts,
      total,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

// =================== CREATE PRODUCT ===================
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()

    if (!body.title || !body.description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 })
    }

    if (!body.category || body.category === "none" || body.category === "") {
      delete body.category
    }
    if (!body.subcategory || body.subcategory === "none" || body.subcategory === "") {
      delete body.subcategory
    }
    if (!body.brand || body.brand === "none" || body.brand === "") {
      delete body.brand
    }

    if (body.options?.length > 0) {
      if (!body.variants || body.variants.length === 0) {
        body.variants = generateVariants(body.options, 0)
      }
    } else if (!body.variants || body.variants.length === 0) {
      body.variants = [getDefaultVariant()]
    }

    const product = new Product(body)
    await product.save()

    const populatedProduct = await Product.findById(product._id)
      .populate("category", "name")
      .populate("subcategory", "name")
      .populate("brand", "name")

    return NextResponse.json(populatedProduct, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}

// =================== UPDATE PRODUCT ===================
export async function PUT(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    if (!updateData.category || updateData.category === "none" || updateData.category === "") {
      updateData.category = null
    }
    if (!updateData.subcategory || updateData.subcategory === "none" || updateData.subcategory === "") {
      updateData.subcategory = null
    }
    if (!updateData.brand || updateData.brand === "none" || updateData.brand === "") {
      updateData.brand = null
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("category", "name")
      .populate("subcategory", "name")
      .populate("brand", "name")

    if (!updatedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

// =================== DELETE PRODUCT ===================
export async function DELETE(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    const deletedProduct = await Product.findByIdAndDelete(id)

    if (!deletedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}

// =================== HELPERS ===================
function getDefaultVariant() {
  return {
    title: "Default Title",
    price: 0,
    compareAtPrice: null,
    costPerItem: null,
    profit: null,
    margin: null,
    sku: "",
    barcode: "",
    inventoryQuantity: 0,
    trackQuantity: true,
    continueSellingWhenOutOfStock: false,
    weight: 0,
    weightUnit: "kg",
    requiresShipping: true,
    taxable: true,
    images: [],
    optionValues: [],
    isActive: true,
  }
}

function generateVariants(options: any[], basePrice: number) {
  const combinations = generateCombinations(options)

  return combinations.map((combination) => ({
    title: combination.map((opt: any) => opt.value).join(" / "),
    price: basePrice,
    compareAtPrice: null,
    costPerItem: null,
    profit: null,
    margin: null,
    sku: "",
    barcode: "",
    inventoryQuantity: 0,
    trackQuantity: true,
    continueSellingWhenOutOfStock: false,
    weight: 0,
    weightUnit: "kg",
    requiresShipping: true,
    taxable: true,
    images: [],
    optionValues: combination,
    isActive: true,
  }))
}

function generateCombinations(options: any[]): any[] {
  if (options.length === 0) return []
  if (options.length === 1) {
    return options[0].values
      .filter((value: string) => value.trim())
      .map((value: string) => [{ optionName: options[0].name, value }])
  }

  const result: any[] = []
  const firstOption = options[0]
  const restCombinations = generateCombinations(options.slice(1))

  for (const value of firstOption.values.filter((v: string) => v.trim())) {
    for (const rest of restCombinations) {
      result.push([{ optionName: firstOption.name, value }, ...rest])
    }
  }

  return result
}
