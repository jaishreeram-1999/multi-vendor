"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Upload, X } from "lucide-react"
import Image from "next/image"

interface Brand {
  _id?: string
  name: string
  description: string
  icon: string
  isActive: boolean
}

interface BrandFormProps {
  brand?: Brand
  isEdit?: boolean
}

export function BrandForm({ brand, isEdit = false }: BrandFormProps) {
  const [formData, setFormData] = useState({
    name: brand?.name || "",
    description: brand?.description || "",
    icon: brand?.icon || "",
    isActive: brand?.isActive ?? true,
  })
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleFileUpload = async (file: File) => {
    setUploading(true)
    try {
      const formData:any = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        
        setFormData((prev) => ({ ...prev, icon: data.url }))
        toast({
          title: "Success",
          description: "Icon uploaded successfully",
        })
      } else {
        throw new Error("Upload failed")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload icon",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = isEdit ? `/api/admin/brands/${brand?._id}` : "/api/admin/brands"
      const method = isEdit ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Brand ${isEdit ? "updated" : "created"} successfully`,
        })
        router.push("/admin/brands")
      } else {
        throw new Error(`Failed to ${isEdit ? "update" : "create"} brand`)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEdit ? "update" : "create"} brand`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Brand" : "Create New Brand"}</CardTitle>
        <CardDescription>{isEdit ? "Update brand information" : "Add a new brand to your store"}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Brand Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Enter brand name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Enter brand description"
              required
            />
          </div>

          <div className="space-y-2">
  <Label>Brand Icon</Label>
  <div className="flex items-center gap-4">
    
    {formData.icon ? ( 
      <div className="relative">
        <Image
          src={formData.icon || "/placeholder.svg"}
          alt="Brand logo"
          width={64}
          height={64}
          className="rounded-md border object-cover"
        />
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
          onClick={() => setFormData((prev) => ({ ...prev, icon: "" }))}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    ) : (
      <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center">
        <Upload className="h-6 w-6 text-gray-400" />
      </div>
    )}
    <div>
      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Upload Icon"}
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFileUpload(file)
        }}
      />
    </div>
  </div>
</div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : isEdit ? "Update Brand" : "Create Brand"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard/brands")}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
