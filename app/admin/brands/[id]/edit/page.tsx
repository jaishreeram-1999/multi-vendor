"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { BrandForm } from "../../_components/brand-form"
import { useToast } from "@/hooks/use-toast"
import { Loader2Icon } from "lucide-react"

interface Brand {
  _id: string
  name: string
  description: string
  icon: string
  isActive: boolean
}

export default function EditBrandPage() {
  const [brand, setBrand] = useState<Brand | null>(null)
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const { toast } = useToast()

  useEffect(() => {
    const fetchBrand = async () => {
      try {
        const response = await fetch(`/api/admin/brands/${params?.id}`)
        if (response.ok) {
          const data = await response.json()
          setBrand(data)
        } else {
          throw new Error("Failed to fetch brand")
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch brand",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchBrand()
    }
  }, [params.id, toast])

  if (loading) {
  return (
    <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-2">
      <Loader2Icon className="h-10 w-10 animate-spin text-primary" />
      <p className="text-sm font-medium text-muted-foreground">Loading brands...</p>
    </div>
  )
}

  if (!brand) {
    return <div>Brand not found</div>
  }

  return (
    <div className="space-y-6 px-2 py-4">
      <div>
        <h1 className="text-3xl font-bold">Edit Brand</h1>
        <p className="text-muted-foreground">Update brand information</p>
      </div>
      <BrandForm brand={brand} isEdit />
    </div>
  )
}
