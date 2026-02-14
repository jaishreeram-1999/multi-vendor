"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Upload } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"

interface ProductImage {
  url: string
  altText: string
  position: number
}

interface ProductImagesProps {
  images: ProductImage[]
  onImagesChange: (images: ProductImage[]) => void
}

export function ProductImages({ images, onImagesChange }: ProductImagesProps) {
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    const uploadPromises = Array.from(files).map(async (file) => {
      const formData = new FormData()
      formData.append("file", file)

      try {
        const response = await fetch("/api/admin/upload-image", {
          method: "POST",
          body: formData,
        })

        if (response.ok) {
          const data = await response.json()
          return {
            url: data.url,
            altText: "", // Default alt text, can be edited later
            position: 0, // Position will be updated after all uploads
          }
        } else {
          throw new Error("Upload failed")
        }
      } catch (error) {
        console.error("Error uploading image:", error)
        toast({
          title: "Error",
          description: `Failed to upload image: ${file.name}`,
          variant: "destructive",
        })
        return null
      }
    })

    const uploadedImages = (await Promise.all(uploadPromises)).filter((img) => img !== null) as ProductImage[]

    if (uploadedImages.length > 0) {
      const updatedImages = [...images, ...uploadedImages].map((img, index) => ({
        ...img,
        position: index,
      }))
      onImagesChange(updatedImages)
      toast({
        title: "Success",
        description: `${uploadedImages.length} image(s) uploaded successfully.`,
      })
    }
    setUploading(false)
  }

  const removeImage = (indexToRemove: number) => {
    const updatedImages = images
      .filter((_, index) => index !== indexToRemove)
      .map((img, index) => ({ ...img, position: index })) // Re-index positions
    onImagesChange(updatedImages)
  }

  const updateImageAltText = (indexToUpdate: number, newAltText: string) => {
    const updatedImages = images.map((img, index) => (index === indexToUpdate ? { ...img, altText: newAltText } : img))
    onImagesChange(updatedImages)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Media</CardTitle>
        <CardDescription>Add images to your product.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-colors"
          onClick={() => document.getElementById("image-upload-input")?.click()}
        >
          <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600">{uploading ? "Uploading..." : "Add files"}</p>
          <p className="text-xs text-gray-500 mt-1">Drag and drop or click to upload</p>
        </div>
        <input
          id="image-upload-input"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleImageUpload}
        />

        {/* Image Grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square relative rounded-lg overflow-hidden border">
                  <Image
                    src={image.url || "/placeholder.svg"}
                    alt={image.altText || `Product image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200" />
                  {/* Remove Button */}
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => removeImage(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  {/* Primary Badge */}
                  {index === 0 && (
                    <div className="absolute bottom-1 left-1">
                      <span className="bg-blue-600 text-white text-xs px-1 py-0.5 rounded">Primary</span>
                    </div>
                  )}
                </div>
                {/* Alt Text Input */}
                <div className="mt-1">
                  <Input
                    placeholder="Alt text"
                    value={image.altText}
                    onChange={(e) => updateImageAltText(index, e.target.value)}
                    className="text-xs h-8"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
