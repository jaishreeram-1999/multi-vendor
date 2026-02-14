"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { X, Plus } from "lucide-react"
import { ProductVariants } from "./product-variants"
import { ProductImages } from "./product-images"
import { ProductPricing } from "./product-pricing"

interface Product {
  _id?: string
  title: string
  description: string
  tax: number
  handle: string
  status: string
  productType: string
  productDimensions: {
    length: string
    width: string
    height: string
  }

  vendor: string
  tags: string[]
  category: string
  subcategory: string
  brand: string
  collections: string[]
  featured: boolean
  bestSeller: boolean
  trending: boolean
  images: Array<{
    url: string
    altText: string
    position: number
  }>
  options: Array<{
    name: string
    values: string[]
  }>
  variants: Array<{
    title: string
    price: number
    compareAtPrice?: number
    costPerItem?: number
    sku: string
    barcode: string
    inventoryQuantity: number
    trackQuantity: boolean
    continueSellingWhenOutOfStock: boolean
    hasSkuBarcode: boolean
    weight: number
    weightUnit: string
    requiresShipping: boolean
    taxable: boolean
    images: Array<{
      url: string
      altText: string
      position: number
    }>
    optionValues: Array<{
      optionName: string
      value: string
    }>
    isActive: boolean
  }>
  seoTitle: string
  seoDescription: string
  isActive: boolean
}

interface ProductFormProps {
  product?: Product & {
    category?: { _id: string; name: string } | string
    subcategory?: { _id: string; name: string } | string
    brand?: { _id: string; name: string } | string
  }
  isEdit?: boolean
}

interface Category {
  _id: string
  name: string
  parentCategory?: {
    _id: string
    name: string
  }
}

interface Brand {
  _id: string
  name: string
}

export function ProductForm({ product, isEdit = false }: ProductFormProps) {
  const [formData, setFormData] = useState<Product>(() => {
    const initialProduct = product
      ? {
        ...product,
        category:
          typeof product.category === "object" ? product.category?._id || "" : product.category || "",
        subcategory:
          typeof product.subcategory === "object"
            ? product.subcategory?._id || ""
            : product.subcategory || "",
        brand: typeof product.brand === "object" ? product.brand?._id || "" : product.brand || "",
      }
      : {
        title: "",
        description: "",
        handle: "",
        tax: 0,
        status: "draft",
        productType: "",
        productDimensions: {
          length: "",
          width: "",
          height: "",
        },

        vendor: "",
        tags: [],
        category: "",
        subcategory: "",
        brand: "",
        collections: [],
        featured: false,
        bestSeller: false,
        trending: false,
        images: [],
        options: [],
        variants: [],
        seoTitle: "",
        seoDescription: "",
        isActive: true,
      }

    if (initialProduct.options.length === 0 && initialProduct.variants.length === 0) {
      initialProduct.variants = [
        {
          title: "Default Variant",
          price: 0,
          compareAtPrice: undefined,
          costPerItem: undefined,
          sku: "",
          barcode: "",
          inventoryQuantity: 0,
          trackQuantity: true,
          continueSellingWhenOutOfStock: false,
          hasSkuBarcode: false,
          weight: 0,
          weightUnit: "kg",
          requiresShipping: true,
          taxable: true,
          images: [],
          optionValues: [],
          isActive: true,
        },
      ]
    } else if (initialProduct.options.length === 0 && initialProduct.variants.length > 0) {
      initialProduct.variants[0].hasSkuBarcode =
        !!initialProduct.variants[0].sku || !!initialProduct.variants[0].barcode
    }
    return initialProduct
  })

  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const [mainCategories, setMainCategories] = useState<Category[]>([])
  const [subCategories, setSubCategories] = useState<Category[]>([])

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, brandsRes] = await Promise.all([
          fetch("/api/admin/categories"),
          fetch("/api/admin/brands"),
        ])

        // Is block ko replace karein apne useEffect ke andar:
if (categoriesRes.ok) {
  const categoriesData = await categoriesRes.json();
  const allCats = categoriesData.AllCategories || []; // Fallback to empty array
  setCategories(allCats);

  // Safe filter logic
  const mains = allCats.filter((cat: Category) => !cat.parentCategory);
  setMainCategories(mains);
}

if (brandsRes.ok) {
  const brandsData = await brandsRes.json();
  // Ensure brandsData.totalBrands is an array
  setBrands(Array.isArray(brandsData.totalBrands) ? brandsData.totalBrands : []);
}

        if (brandsRes.ok) {
          const brandsData = await brandsRes.json()
          setBrands(brandsData.totalBrands)
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
      }
    }
    fetchData()
  }, [])

useEffect(() => {
  // Check if categories is actually an array
  if (Array.isArray(categories) && categories.length > 0 && formData.category) {
    const subs = categories.filter(
      (cat) => cat.parentCategory && cat.parentCategory._id === formData.category
    );
    setSubCategories(subs);

    if (formData.subcategory && !subs.some((sub) => sub._id === formData.subcategory)) {
      setFormData((prev) => ({ ...prev, subcategory: "" }));
    }
  } else {
    setSubCategories([]); // Reset if no category selected
  }
}, [categories, formData.category]);

  useEffect(() => {
    if (formData.title && !isEdit) {
      const handle = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
      setFormData((prev) => ({ ...prev, handle }))
    }
  }, [formData.title, isEdit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const url = isEdit ? `/api/admin/products/${product?._id}` : "/api/admin/products"
      const method = isEdit ? "PUT" : "POST"

      const submitData = {
        ...formData,
        category: formData.category || undefined,
        subcategory: formData.subcategory || undefined,
        brand: formData.brand || undefined,
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Product ${isEdit ? "updated" : "created"} successfully`,
        })
        router.push("/admin/products")
      } else {
        const errorData = await response.json()
        console.error("Error response:", errorData)
        throw new Error(errorData.error || `Failed to ${isEdit ? "update" : "create"} product`)
      }
    } catch (error) {
      console.error("Submit error:", error)
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : `Failed to ${isEdit ? "update" : "create"} product`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }))
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const handleOptionsChange = (options: Array<{ name: string; values: string[] }>) => {
    setFormData((prev) => ({ ...prev, options }))
  }

  const handleVariantsChange = (variants: Product["variants"]) => {
    setFormData((prev) => ({ ...prev, variants }))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Side */}
      <div className="lg:col-span-2 space-y-6">
        {/* Product Info */}
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Short sleeve t-shirt"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Product description"
                rows={4}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Product Images */}
        <ProductImages
          images={formData.images}
          onImagesChange={(images) => setFormData((prev) => ({ ...prev, images }))}
        />

        {/* Variants / Pricing */}
        {formData.options.length === 0 ? (
          <>
            <ProductPricing
              price={formData.variants[0]?.price || 0}
              compareAtPrice={formData.variants[0]?.compareAtPrice}
              taxable={formData.variants[0]?.taxable || false}
              costPerItem={formData.variants[0]?.costPerItem}
              sku={formData.variants[0]?.sku || ""}
              barcode={formData.variants[0]?.barcode || ""}
              inventoryQuantity={formData.variants[0]?.inventoryQuantity || 0}
              trackQuantity={formData.variants[0]?.trackQuantity ?? true}
              continueSellingWhenOutOfStock={
                formData.variants[0]?.continueSellingWhenOutOfStock ?? false
              }
              hasSkuBarcode={formData.variants[0]?.hasSkuBarcode ?? false}
              onPriceChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  variants: [{ ...prev.variants[0], price: value }],
                }))
              }
              onCompareAtPriceChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  variants: [{ ...prev.variants[0], compareAtPrice: value }],
                }))
              }
              onTaxableChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  variants: [{ ...prev.variants[0], taxable: checked }],
                }))
              }
              onCostPerItemChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  variants: [{ ...prev.variants[0], costPerItem: value }],
                }))
              }
              onSkuChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  variants: [{ ...prev.variants[0], sku: value }],
                }))
              }
              onBarcodeChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  variants: [{ ...prev.variants[0], barcode: value }],
                }))
              }
              onInventoryQuantityChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  variants: [{ ...prev.variants[0], inventoryQuantity: value }],
                }))
              }
              onTrackQuantityChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  variants: [{ ...prev.variants[0], trackQuantity: checked }],
                }))
              }
              onContinueSellingWhenOutOfStockChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  variants: [{ ...prev.variants[0], continueSellingWhenOutOfStock: checked }],
                }))
              }
              onHasSkuBarcodeChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  variants: [{ ...prev.variants[0], hasSkuBarcode: checked }],
                }))
              }
            />
            <Card>
              <CardHeader>
                <CardTitle>Variants</CardTitle>
                <CardDescription>
                  Add variants if this product comes in multiple options, like size or color.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      options: [{ name: "Size", values: [""] }],
                      variants: [],
                    }))
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add options
                </Button>
              </CardContent>
            </Card>
          </>
        ) : (
          <ProductVariants
            options={formData.options}
            variants={formData.variants}
            onOptionsChange={handleOptionsChange}
            onVariantsChange={handleVariantsChange}
          />
        )}

        {/* SEO Section */}
        <Card>
          <CardHeader>
            <CardTitle>Search Engine Listing</CardTitle>
            <CardDescription>
              Add a title and description to see how this product might appear in a search engine
              listing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="seoTitle">Page title</Label>
              <Input
                id="seoTitle"
                value={formData.seoTitle}
                onChange={(e) => setFormData((prev) => ({ ...prev, seoTitle: e.target.value }))}
                placeholder={formData.title}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seoDescription">Meta description</Label>
              <Textarea
                id="seoDescription"
                value={formData.seoDescription}
                onChange={(e) => setFormData((prev) => ({ ...prev, seoDescription: e.target.value }))}
                placeholder="Product description for search engines"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Side */}
      <div className="space-y-6">
        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Product Organization */}
        <Card>
          <CardHeader>
            <CardTitle>Product Organization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="productType">Product type</Label>
              <Input
                id="productType"
                value={formData.productType}
                onChange={(e) => setFormData((prev) => ({ ...prev, productType: e.target.value }))}
                placeholder="e.g., T-Shirt"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor</Label>
              <Input
                id="vendor"
                value={formData.vendor}
                onChange={(e) => setFormData((prev) => ({ ...prev, vendor: e.target.value }))}
                placeholder="e.g., Nike"
              />
            </div>

            {/* Tax */}
            <div className="space-y-2">
              <Label htmlFor="tax">Tax Rate (%)</Label>
              <Select
                value={formData.tax?.toString()}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, tax: Number.parseFloat(value) }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tax rate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0% - No Tax</SelectItem>
                  <SelectItem value="5">5% - Essential Goods</SelectItem>
                  <SelectItem value="12">12% - Standard Rate</SelectItem>
                  <SelectItem value="18">18% - Standard Rate</SelectItem>
                  <SelectItem value="28">28% - Luxury Goods</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Product Features</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, featured: !!checked }))
                    }
                  />
                  <Label htmlFor="featured" className="text-sm font-normal">
                    Featured Product
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="bestSeller"
                    checked={formData.bestSeller}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, bestSeller: !!checked }))
                    }
                  />
                  <Label htmlFor="bestSeller" className="text-sm font-normal">
                    Best Seller
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="trending"
                    checked={formData.trending}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, trending: !!checked }))
                    }
                  />
                  <Label htmlFor="trending" className="text-sm font-normal">
                    Trending
                  </Label>
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <div>
                <Label>Main Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {mainCategories.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Subcategory</Label>
                <Select
                  value={formData.subcategory || ""}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, subcategory: value }))}
                  disabled={!subCategories.length}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {subCategories.map((sub) => (
                      <SelectItem key={sub._id} value={sub._id}>
                        {sub.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Brand */}
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Select
                value={formData.brand}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, brand: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Brand</SelectItem>
                  {Array.isArray(brands) &&
                    brands.map((brand) => (
                      <SelectItem key={brand._id} value={brand._id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                />
                <Button type="button" onClick={addTag} size="sm">
                  Add
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <div
                      key={index}
                      className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm flex items-center gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Dimensions */}
            <div className="space-y-2">
              <Label>Product Dimensions</Label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  value={formData.productDimensions?.length || ""}
                  onChange={(e) => setFormData((prev) => ({
                    ...prev,
                    productDimensions: {
                      ...prev.productDimensions,
                      length: e.target.value
                    }
                  }))}
                  placeholder="Length"
                />
                <Input
                  value={formData.productDimensions?.width || ""}
                  onChange={(e) => setFormData((prev) => ({
                    ...prev,
                    productDimensions: {
                      ...prev.productDimensions,
                      width: e.target.value
                    }
                  }))}
                  placeholder="Width"
                />
                <Input
                  value={formData.productDimensions?.height || ""}
                  onChange={(e) => setFormData((prev) => ({
                    ...prev,
                    productDimensions: {
                      ...prev.productDimensions,
                      height: e.target.value
                    }
                  }))}
                  placeholder="Height"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save / Cancel */}
        <div className="flex gap-4">
          <Button type="submit" onClick={handleSubmit} disabled={loading} className="flex-1">
            {loading ? "Saving..." : isEdit ? "Update Product" : "Save Product"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/dashboard/products")}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
