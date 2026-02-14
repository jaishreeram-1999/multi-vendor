"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { ProductForm } from "../../_components/product-form"
import { useToast } from "@/hooks/use-toast"

interface Product {
  _id: string
  title: string
  description: string
  handle: string
  status: string
  productType: string
  vendor: string
  tags: string[]
  category: string
  brand: string
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
    image: string
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

export default function EditProductPage() {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const { toast } = useToast()

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/admin/products/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setProduct(data)
        } else {
          throw new Error("Failed to fetch product")
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch product",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProduct()
    }
  }, [params.id, toast])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!product) {
    return <div>Product not found</div>
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Product</h1>
        <p className="text-muted-foreground">Update product information</p>
      </div>
      <ProductForm product={product} isEdit />
    </div>
  )
}
