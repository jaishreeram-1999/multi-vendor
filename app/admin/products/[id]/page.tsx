"use client"

import { Label } from "@/components/ui/label"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit, ArrowLeft, Package, ShoppingCart, Heart, Share2, Star, Truck, Shield, RotateCcw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import Link from "next/link"

interface Product {
  _id: string
  title: string
  description: string
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
  category: {
    _id: string
    name: string
  }
  brand: {
    _id: string
    name: string
  }
  collections: string[]
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
  createdAt: string
  updatedAt: string
}

export default function ProductDetailPage() {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(0)
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string }>({})
  const [quantity, setQuantity] = useState(1)
  const [currentImages, setCurrentImages] = useState<Array<{ url: string; altText: string; position: number }>>([])
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/admin/products/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setProduct(data)

          // Initialize selected options with first variant
          if (data.variants && data.variants.length > 0) {
            const firstVariant = data.variants[0]
            const initialOptions: { [key: string]: string } = {}
            firstVariant.optionValues.forEach((ov: any) => {
              initialOptions[ov.optionName] = ov.value
            })
            setSelectedOptions(initialOptions)
          }
        } else {
          throw new Error("Failed to fetch product")
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch product",
          variant: "destructive",
        })
        // router.push("/dashboard/products")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProduct()
    }
  }, [params.id, toast, router])

  // Find current variant based on selected options
  useEffect(() => {
    if (product && product.variants) {
      const variant = product.variants.find((v) =>
        v.optionValues.every((ov) => selectedOptions[ov.optionName] === ov.value),
      )
      if (variant) {
        const variantIndex = product.variants.indexOf(variant)
        setSelectedVariant(variantIndex)

        // Update current images based on variant selection
        if (variant.images && variant.images.length > 0) {
          setCurrentImages(variant.images)
          setSelectedImage(0) // Reset to first image of the variant
        } else {
          // Fallback to product images if variant has no images
          setCurrentImages(product.images || [])
          setSelectedImage(0)
        }
      }
    }
  }, [selectedOptions, product])

  useEffect(() => {
    if (product) {
      // Initialize with first variant images or product images
      const firstVariant = product.variants[0]
      if (firstVariant?.images && firstVariant.images.length > 0) {
        setCurrentImages(firstVariant.images)
      } else {
        setCurrentImages(product.images || [])
      }
    }
  }, [product])

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value,
    }))
  }

  const handleAddToCart = () => {
    toast({
      title: "Added to Cart",
      description: `${quantity} x ${product?.title} added to cart`,
    })
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!product) {
    return <div className="flex items-center justify-center min-h-screen">Product not found</div>
  }

  const currentVariant = product.variants[selectedVariant]
  const isInStock = currentVariant?.inventoryQuantity > 0 || currentVariant?.continueSellingWhenOutOfStock
  const discount = currentVariant?.compareAtPrice
    ? Math.round(((currentVariant.compareAtPrice - currentVariant.price) / currentVariant.compareAtPrice) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gray-50 px-2 py-4">
      {/* Admin Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
            <Badge variant="outline">Admin Preview</Badge>
          </div>
          <Button asChild>
            <Link href={`/dashboard/products/${product._id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Product
            </Link>
          </Button>
        </div>
      </div>

      {/* Product Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-white rounded-lg overflow-hidden border">
              {currentImages && currentImages.length > 0 ? (
                <Image
                  src={currentImages[selectedImage]?.url || "/placeholder.svg"}
                  alt={currentImages[selectedImage]?.altText || product.title}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <Package className="h-24 w-24 text-gray-400" />
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {currentImages && currentImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {currentImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${selectedImage === index ? "border-blue-500" : "border-gray-200"
                      }`}
                  >
                    <Image
                      src={image.url || "/placeholder.svg"}
                      alt={image.altText || `${product.title} ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="text-sm text-gray-500">
              <Link href="/dashboard/products" className="hover:text-gray-700">
                Products
              </Link>
              {product.category && (
                <>
                  <span className="mx-2">/</span>
                  <span>{product.category.name}</span>
                </>
              )}
              <span className="mx-2">/</span>
              <span>{product.title}</span>
            </div>

            {/* Brand */}
            {product.brand && <div className="text-sm text-blue-600 font-medium">{product.brand.name}</div>}

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-sm text-gray-600">(4.8) • 124 reviews</span>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-gray-900">${currentVariant?.price.toFixed(2)}</span>
                {currentVariant?.compareAtPrice && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      ${currentVariant.compareAtPrice.toFixed(2)}
                    </span>
                    <Badge variant="destructive" className="text-sm">
                      {discount}% OFF
                    </Badge>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-600">Tax included. Shipping calculated at checkout.</p>
            </div>

            {/* Variant Options */}
            {product.options && product.options.length > 0 && (
              <div className="space-y-4">
                {product.options.map((option) => (
                  <div key={option.name} className="space-y-2">
                    <Label className="text-sm font-medium text-gray-900">
                      {option.name}: <span className="font-normal">{selectedOptions[option.name]}</span>
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {option.values.map((value) => (
                        <button
                          key={value}
                          onClick={() => handleOptionChange(option.name, value)}
                          className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${selectedOptions[option.name] === value
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                            }`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {product.productDimensions && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Dimensions</span>
                <span className="font-medium">
                  {product.productDimensions.length} ×
                  {product.productDimensions.width} ×
                  {product.productDimensions.height}
                </span>
              </div>
            )}


            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-900">Quantity</Label>
                  <Select value={quantity.toString()} onValueChange={(value) => setQuantity(Number.parseInt(value))}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(Math.min(10, currentVariant?.inventoryQuantity || 1))].map((_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-sm text-gray-600">{currentVariant?.inventoryQuantity} available</div>
              </div>

              <div className="flex gap-3">
                <Button size="lg" className="flex-1" onClick={handleAddToCart} disabled={!isInStock}>
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {isInStock ? "Add to Cart" : "Out of Stock"}
                </Button>
                <Button size="lg" variant="outline">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Product Features */}
            <div className="grid grid-cols-3 gap-4 py-6 border-t border-b">
              <div className="text-center">
                <Truck className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <div className="text-sm font-medium">Free Shipping</div>
                <div className="text-xs text-gray-600">On orders over $50</div>
              </div>
              <div className="text-center">
                <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <div className="text-sm font-medium">Secure Payment</div>
                <div className="text-xs text-gray-600">SSL encrypted</div>
              </div>
              <div className="text-center">
                <RotateCcw className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                <div className="text-sm font-medium">Easy Returns</div>
                <div className="text-xs text-gray-600">30-day policy</div>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                <span className="font-medium">SKU:</span> {currentVariant?.sku || "N/A"}
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Category:</span> {product.category?.name || "Uncategorized"}
              </div>
              {product.tags && product.tags.length > 0 && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Tags:</span> {product.tags.join(", ")}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews (124)</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{product.description}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specifications" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Product Details</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-gray-600">Brand</span>
                          <span className="font-medium">{product.brand?.name || "N/A"}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-gray-600">Type</span>
                          <span className="font-medium">{product.productType || "N/A"}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-gray-600">Vendor</span>
                          <span className="font-medium">{product.vendor || "N/A"}</span>
                        </div>
                        {currentVariant?.weight && (
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">Weight</span>
                            <span className="font-medium">
                              {currentVariant.weight} {currentVariant.weightUnit}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Variant Options</h3>
                      <div className="space-y-2">
                        {product.options?.map((option) => (
                          <div key={option.name} className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">{option.name}</span>
                            <span className="font-medium">{option.values.join(", ")}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <Star className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium mb-2">No reviews yet</h3>
                    <p className="text-gray-600">Be the first to review this product</p>
                    <Button className="mt-4">Write a Review</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="shipping" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-4">Shipping Information</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Truck className="h-5 w-5 text-green-600" />
                          <div>
                            <div className="font-medium">Free Standard Shipping</div>
                            <div className="text-sm text-gray-600">On orders over $50 • 5-7 business days</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Truck className="h-5 w-5 text-blue-600" />
                          <div>
                            <div className="font-medium">Express Shipping - $9.99</div>
                            <div className="text-sm text-gray-600">2-3 business days</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Truck className="h-5 w-5 text-purple-600" />
                          <div>
                            <div className="font-medium">Next Day Delivery - $19.99</div>
                            <div className="text-sm text-gray-600">Order by 2 PM for next day delivery</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="font-semibold text-lg mb-4">Return Policy</h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>• 30-day return window from delivery date</p>
                        <p>• Items must be in original condition with tags attached</p>
                        <p>• Free returns for defective or damaged items</p>
                        <p>• Return shipping fee applies for change of mind returns</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
