import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Product } from "@/models/Product"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    
    // Unwrapping params here
    const { id } = await params; 

    const product = await Product.findById(id).populate("category", "name").populate("brand", "name");

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    
    // params ko await karke id nikalna zaroori hai
    const { id } = await params
    const body = await request.json()

    // ✅ CLEAN options values
    if (body.options && body.options.length > 0) {
      body.options = body.options
        .map((opt: any) => ({
          ...opt,
          values: opt.values.filter((v: string) => v.trim() !== ""),
        }))
        .filter((opt: any) => opt.values.length > 0)
    }

    // OPTIONAL productDimensions
    if (
      !body.productDimensions ||
      (!body.productDimensions.length && !body.productDimensions.width && !body.productDimensions.height)
    ) {
      delete body.productDimensions
    }

    // params.id ki jagah seedha 'id' use karein
    const existingProduct = await Product.findById(id)

    // Regenerate variants if options changed
    if (body.options && body.options.length > 0) {
      if (existingProduct && JSON.stringify(existingProduct.options) !== JSON.stringify(body.options)) {
        body.variants = generateVariants(
          body.options,
          body.basePrice || existingProduct.variants[0]?.price || 0,
          existingProduct.variants,
        )
      }
    }

    const product = await Product.findByIdAndUpdate(id, body, { new: true, runValidators: true })
      .populate("category", "name")
      .populate("brand", "name")

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Update error:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    
    // params ko await karein
    const { id } = await params
    
    const product = await Product.findByIdAndDelete(id)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}

function generateVariants(options: any[], basePrice: number, existingVariants: any[] = []) {
  if (options.length === 0) return []

  const combinations = generateCombinations(options)

  return combinations.map((combination, index) => {
    // Try to find matching variant in existing variants to preserve inventory
    const variantTitle = combination.map((opt: any) => opt.value).join(" / ")
    const existingVariant = existingVariants?.find(
      (v: any) => v.title === variantTitle || compareOptionValues(v.optionValues, combination),
    )

    return {
      title: variantTitle,
      price: basePrice,
      compareAtPrice: null,
      costPerItem: null,
      profit: null,
      margin: null,
      sku: existingVariant?.sku || "",
      barcode: existingVariant?.barcode || "",
      inventoryQuantity: existingVariant?.inventoryQuantity ?? 0, // Preserve inventory
      trackQuantity: true,
      continueSellingWhenOutOfStock: false,
      weight: 0,
      weightUnit: "kg",
      requiresShipping: true,
      taxable: true,
      images: [],
      optionValues: combination,
      isActive: true,
    }
  })
}

function generateCombinations(options: any[]): any[] {
  if (options.length === 0) return []
  if (options.length === 1) {
    return options[0].values.map((value: string) => [{ optionName: options[0].name, value }])
  }

  const result: any[] = []
  const firstOption = options[0]
  const restCombinations = generateCombinations(options.slice(1))

  for (const value of firstOption.values) {
    for (const restCombination of restCombinations) {
      result.push([{ optionName: firstOption.name, value }, ...restCombination])
    }
  }

  return result
}

function compareOptionValues(existingOptions: any[], newOptions: any[]): boolean {
  if (!existingOptions || !newOptions) return false
  if (existingOptions.length !== newOptions.length) return false

  return existingOptions.every((existing: any, index: number) => {
    const newOption = newOptions[index]
    return existing.optionName === newOption.optionName && existing.value === newOption.value
  })
}
