"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Trash2, GripVertical, X, ImageIcon, Edit, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface ProductOption {
  name: string
  values: string[]
}

interface ProductVariant {
  title: string
  price: number
  compareAtPrice?: number
  costPerItem?: number
  profit?: number
  margin?: number
  sku: string
  barcode: string
  inventoryQuantity: number
  trackQuantity: boolean
  continueSellingWhenOutOfStock: boolean
  hasSkuBarcode: boolean // Added to ProductVariant interface
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
}

interface ProductVariantsProps {
  options: ProductOption[]
  variants: ProductVariant[]
  onOptionsChange: (options: ProductOption[]) => void
  onVariantsChange: (variants: ProductVariant[]) => void
}

export function ProductVariants({ options, variants, onOptionsChange, onVariantsChange }: ProductVariantsProps) {
  const [showVariantDialog, setShowVariantDialog] = useState(false)
  const [newOption, setNewOption] = useState({ name: "", values: [""] })
  const [uploading, setUploading] = useState(false)
  const [editingVariant, setEditingVariant] = useState<{
    index: number
    variant: ProductVariant
  } | null>(null)
  const { toast } = useToast()

  // Generate variants whenever options change
  useEffect(() => {
    if (options.length > 0) {
      generateVariants(options)
    } else {
      // If no options, clear variants
      onVariantsChange([])
    }
  }, [options])

  const addOption = () => {
    if (newOption.name && newOption.values.some((v) => v.trim())) {
      const filteredValues = newOption.values.filter((v) => v.trim())
      const updatedOptions = [...options]
      updatedOptions.push({ name: newOption.name, values: filteredValues })
      onOptionsChange(updatedOptions)
      setNewOption({ name: "", values: [""] })
      setShowVariantDialog(false)
    }
  }

  const removeOption = (index: number) => {
    const updatedOptions = options.filter((_, i) => i !== index)
    onOptionsChange(updatedOptions)
  }

  const updateOptionValue = (optionIndex: number, valueIndex: number, value: string) => {
    const updatedOptions = [...options]
    updatedOptions[optionIndex].values[valueIndex] = value
    onOptionsChange(updatedOptions)
  }

  const addOptionValue = (optionIndex: number) => {
    const updatedOptions = [...options]
    updatedOptions[optionIndex].values.push("")
    onOptionsChange(updatedOptions)
  }

  const removeOptionValue = (optionIndex: number, valueIndex: number) => {
    const updatedOptions = [...options]
    updatedOptions[optionIndex].values.splice(valueIndex, 1)
    onOptionsChange(updatedOptions)
  }

  const generateCombinations = (
    currentOptions: ProductOption[],
  ): Array<Array<{ optionName: string; value: string }>> => {
    if (currentOptions.length === 0) return []
    if (currentOptions.length === 1) {
      return currentOptions[0].values
        .filter((v) => v.trim())
        .map((value) => [{ optionName: currentOptions[0].name, value }])
    }

    const result: Array<Array<{ optionName: string; value: string }>> = []
    const firstOption = currentOptions[0]
    const restCombinations = generateCombinations(currentOptions.slice(1))

    for (const value of firstOption.values.filter((v) => v.trim())) {
      for (const restCombination of restCombinations) {
        result.push([{ optionName: firstOption.name, value }, ...restCombination])
      }
    }
    return result
  }

  const updateVariant = (index: number, field: string, value: any) => {
    const updatedVariants = [...variants]
    updatedVariants[index] = { ...updatedVariants[index], [field]: value }
    onVariantsChange(updatedVariants)
  }

  const handleVariantImageUpload = async (file: File, variantIndex: number) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      })
      if (response.ok) {
        const data = await response.json()
        updateVariant(variantIndex, "image", data.url)
        // Update editing variant if it's the same one
        if (editingVariant && editingVariant.index === variantIndex) {
          setEditingVariant((prev) =>
            prev
              ? {
                  ...prev,
                  variant: { ...prev.variant, image: data.url },
                }
              : null,
          )
        }
        toast({
          title: "Success",
          description: "Variant image uploaded successfully",
        })
      } else {
        throw new Error("Upload failed")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload variant image",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const saveVariantChanges = () => {
    if (editingVariant) {
      const updatedVariants = [...variants]
      updatedVariants[editingVariant.index] = editingVariant.variant
      onVariantsChange(updatedVariants)
      setEditingVariant(null)
      toast({
        title: "Success",
        description: "Variant updated successfully",
      })
    }
  }

  const handleVariantImagesUpload = async (files: File[], variantIndex: number) => {
    setUploading(true)
    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData()
        formData.append("file", file)
        const response = await fetch("/api/admin/upload-image", {
          method: "POST",
          body: formData,
        })
        if (response.ok) {
          const data = await response.json()
          return {
            url: data.url,
            altText: "",
            position: 0,
          }
        } else {
          throw new Error("Upload failed")
        }
      })
      const newImages = await Promise.all(uploadPromises)
      // Update the editing variant
      if (editingVariant && editingVariant.index === variantIndex) {
        const currentImages = editingVariant.variant.images || []
        const updatedImages = [...currentImages, ...newImages].map((img, index) => ({
          ...img,
          position: index,
        }))
        setEditingVariant((prev) =>
          prev
            ? {
                ...prev,
                variant: { ...prev.variant, images: updatedImages },
              }
            : null,
        )
      }
      // Update the main variants array
      const updatedVariants = [...variants]
      const currentImages = updatedVariants[variantIndex].images || []
      updatedVariants[variantIndex] = {
        ...updatedVariants[variantIndex],
        images: [...currentImages, ...newImages].map((img, index) => ({
          ...img,
          position: index,
        })),
      }
      onVariantsChange(updatedVariants)
      toast({
        title: "Success",
        description: "Variant images uploaded successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload variant images",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const removeVariantImage = (variantIndex: number, imageIndex: number) => {
    // Update editing variant
    if (editingVariant && editingVariant.index === variantIndex) {
      const updatedImages = editingVariant.variant.images?.filter((_, i) => i !== imageIndex) || []
      setEditingVariant((prev) =>
        prev
          ? {
              ...prev,
              variant: { ...prev.variant, images: updatedImages.map((img, index) => ({ ...img, position: index })) },
            }
          : null,
      )
    }
    // Update main variants array
    const updatedVariants = [...variants]
    const updatedImages = updatedVariants[variantIndex].images?.filter((_, i) => i !== imageIndex) || []
    updatedVariants[variantIndex] = {
      ...updatedVariants[variantIndex],
      images: updatedImages.map((img, index) => ({ ...img, position: index })),
    }
    onVariantsChange(updatedVariants)
  }

  const updateVariantImageAltText = (variantIndex: number, imageIndex: number, altText: string) => {
    // Update editing variant
    if (editingVariant && editingVariant.index === variantIndex) {
      const updatedImages = [...(editingVariant.variant.images || [])]
      updatedImages[imageIndex] = { ...updatedImages[imageIndex], altText }
      setEditingVariant((prev) =>
        prev
          ? {
              ...prev,
              variant: { ...prev.variant, images: updatedImages },
            }
          : null,
      )
    }
    // Update main variants array
    const updatedVariants = [...variants]
    const updatedImages = [...(updatedVariants[variantIndex].images || [])]
    updatedImages[imageIndex] = { ...updatedImages[imageIndex], altText }
    updatedVariants[variantIndex] = {
      ...updatedVariants[variantIndex],
      images: updatedImages,
    }
    onVariantsChange(updatedVariants)
  }

  const generateVariants = (currentOptions: ProductOption[]) => {
    if (currentOptions.length === 0) {
      onVariantsChange([])
      return
    }

    const combinations = generateCombinations(currentOptions)

    const newVariants = combinations.map((combination) => {
      // Try to find existing variant with same option values
      const existingVariant = variants.find(
        (v) =>
          v.optionValues.length === combination.length &&
          v.optionValues.every((ov) => combination.some((c) => c.optionName === ov.optionName && c.value === ov.value)),
      )

      const variant = {
        title: combination.map((opt) => opt.value).join(" / "),
        price: existingVariant?.price || 0,
        compareAtPrice: existingVariant?.compareAtPrice || undefined,
        costPerItem: existingVariant?.costPerItem || undefined,
        profit: existingVariant?.profit || undefined,
        margin: existingVariant?.margin || undefined,
        sku: existingVariant?.sku || "",
        barcode: existingVariant?.barcode || "",
        inventoryQuantity: existingVariant?.inventoryQuantity || 0,
        trackQuantity: existingVariant?.trackQuantity ?? true,
        continueSellingWhenOutOfStock: existingVariant?.continueSellingWhenOutOfStock ?? false,
        hasSkuBarcode: existingVariant?.hasSkuBarcode ?? false, // Initialize hasSkuBarcode for variants
        weight: existingVariant?.weight || 0,
        weightUnit: existingVariant?.weightUnit || "kg",
        requiresShipping: existingVariant?.requiresShipping ?? true,
        taxable: existingVariant?.taxable ?? true,
        images: existingVariant?.images || [],
        optionValues: combination,
        isActive: existingVariant?.isActive ?? true,
      }
      return variant
    })

    onVariantsChange(newVariants)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Variants</CardTitle>
        <CardDescription>Add variants if this product comes in multiple options, like size or color.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Options Configuration */}
        {options.map((option, optionIndex) => (
          <div key={optionIndex} className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-gray-400" />
                <Label className="font-medium">{option.name}</Label>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => removeOption(optionIndex)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Option values</Label>
              {option.values.map((value, valueIndex) => (
                <div key={valueIndex} className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-gray-400" />
                  <Input
                    value={value}
                    onChange={(e) => updateOptionValue(optionIndex, valueIndex, e.target.value)}
                    placeholder="Option value"
                  />
                  {option.values.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOptionValue(optionIndex, valueIndex)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => addOptionValue(optionIndex)}
                className="text-blue-600"
              >
                Add another value
              </Button>
            </div>
          </div>
        ))}
        {/* Add Option Dialog */}
        <Dialog open={showVariantDialog} onOpenChange={setShowVariantDialog}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" className="w-full bg-transparent">
              <Plus className="h-4 w-4 mr-2" />
              Add another option
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Option</DialogTitle>
              <DialogDescription>Add an option like size or color that buyers can choose from.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="optionName">Option name</Label>
                <Input
                  id="optionName"
                  value={newOption.name}
                  onChange={(e) => setNewOption((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Size"
                />
              </div>
              <div className="space-y-2">
                <Label>Option values</Label>
                {newOption.values.map((value, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={value}
                      onChange={(e) => {
                        const newValues = [...newOption.values]
                        newValues[index] = e.target.value
                        setNewOption((prev) => ({ ...prev, values: newValues }))
                      }}
                      placeholder="Medium"
                    />
                    {newOption.values.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newValues = newOption.values.filter((_, i) => i !== index)
                          setNewOption((prev) => ({ ...prev, values: newValues }))
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setNewOption((prev) => ({ ...prev, values: [...prev.values, ""] }))}
                  className="text-blue-600"
                >
                  Add another value
                </Button>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowVariantDialog(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={addOption}>
                  Done
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        {/* Variants Table */}
        {variants.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Variants ({variants.length})</h3>
            </div>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox />
                    </TableHead>
                    <TableHead>Image</TableHead>
                    <TableHead>Variant</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Compare Price</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Inventory</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {variants.map((variant, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Checkbox />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {variant.images && variant.images.length > 0 ? (
                            <>
                              <Image
                                src={variant.images[0].url || "/placeholder.svg"}
                                alt={variant.images[0].altText || variant.title}
                                width={40}
                                height={40}
                                className="rounded-md object-cover"
                              />
                              {variant.images.length > 1 && (
                                <span className="text-xs text-gray-500 ml-1">+{variant.images.length - 1}</span>
                              )}
                            </>
                          ) : (
                            <div className="w-10 h-10 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center">
                              <ImageIcon className="h-4 w-4 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{variant.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {variant.optionValues.map((ov) => `${ov.optionName}: ${ov.value}`).join(", ")}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">${variant.price.toFixed(2)}</div>
                      </TableCell>
                      <TableCell>
                        {variant.compareAtPrice ? (
                          <div className="text-sm text-muted-foreground line-through">
                            ${variant.compareAtPrice.toFixed(2)}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{variant.sku || "—"}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {variant.inventoryQuantity} {variant.trackQuantity ? "tracked" : "untracked"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={variant.isActive}
                            onCheckedChange={(checked) => updateVariant(index, "isActive", checked)}
                            size="sm"
                          />
                          <span className="text-sm">{variant.isActive ? "Active" : "Inactive"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingVariant({ index, variant: { ...variant } })}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="text-sm text-gray-600 text-center py-2">
              Total inventory: {variants.reduce((sum, v) => sum + v.inventoryQuantity, 0)} units
            </div>
          </div>
        )}
        {/* Detailed Variant Edit Dialog */}
        {editingVariant && (
          <Dialog open={!!editingVariant} onOpenChange={() => setEditingVariant(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Variant: {editingVariant.variant.title}</DialogTitle>
                <DialogDescription>
                  Update all variant details including pricing, inventory, and shipping.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pricing Section */}
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Pricing</h3>
                  <div className="space-y-2">
                    <Label>Price *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editingVariant.variant.price || 0}
                      onChange={(e) =>
                        setEditingVariant((prev) =>
                          prev
                            ? {
                                ...prev,
                                variant: { ...prev.variant, price: Number.parseFloat(e.target.value) || 0 },
                              }
                            : null,
                        )
                      }
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Compare at price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editingVariant.variant.compareAtPrice || ""}
                      onChange={(e) =>
                        setEditingVariant((prev) =>
                          prev
                            ? {
                                ...prev,
                                variant: {
                                  ...prev.variant,
                                  compareAtPrice: Number.parseFloat(e.target.value) || undefined,
                                },
                              }
                            : null,
                        )
                      }
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cost per item</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editingVariant.variant.costPerItem || ""}
                      onChange={(e) =>
                        setEditingVariant((prev) =>
                          prev
                            ? {
                                ...prev,
                                variant: {
                                  ...prev.variant,
                                  costPerItem: Number.parseFloat(e.target.value) || undefined,
                                },
                              }
                            : null,
                        )
                      }
                      placeholder="0.00"
                    />
                  </div>
                </div>
                {/* Inventory Section */}
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Inventory</h3>
                  <div className="space-y-2">
                    <Label>SKU</Label>
                    <Input
                      value={editingVariant.variant.sku || ""}
                      onChange={(e) =>
                        setEditingVariant((prev) =>
                          prev
                            ? {
                                ...prev,
                                variant: { ...prev.variant, sku: e.target.value },
                              }
                            : null,
                        )
                      }
                      placeholder="SKU"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Barcode</Label>
                    <Input
                      value={editingVariant.variant.barcode || ""}
                      onChange={(e) =>
                        setEditingVariant((prev) =>
                          prev
                            ? {
                                ...prev,
                                variant: { ...prev.variant, barcode: e.target.value },
                              }
                            : null,
                        )
                      }
                      placeholder="Barcode"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      value={editingVariant.variant.inventoryQuantity || 0}
                      onChange={(e) =>
                        setEditingVariant((prev) =>
                          prev
                            ? {
                                ...prev,
                                variant: { ...prev.variant, inventoryQuantity: Number.parseInt(e.target.value) || 0 },
                              }
                            : null,
                        )
                      }
                      placeholder="0"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="trackQuantity"
                      checked={editingVariant.variant.trackQuantity}
                      onCheckedChange={(checked) =>
                        setEditingVariant((prev) =>
                          prev
                            ? {
                                ...prev,
                                variant: { ...prev.variant, trackQuantity: !!checked },
                              }
                            : null,
                        )
                      }
                    />
                    <Label htmlFor="trackQuantity">Track quantity</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="continueSellingWhenOutOfStock"
                      checked={editingVariant.variant.continueSellingWhenOutOfStock}
                      onCheckedChange={(checked) =>
                        setEditingVariant((prev) =>
                          prev
                            ? {
                                ...prev,
                                variant: { ...prev.variant, continueSellingWhenOutOfStock: !!checked },
                              }
                            : null,
                        )
                      }
                    />
                    <Label htmlFor="continueSellingWhenOutOfStock">Continue selling when out of stock</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasSkuBarcode"
                      checked={editingVariant.variant.hasSkuBarcode}
                      onCheckedChange={(checked) =>
                        setEditingVariant((prev) =>
                          prev
                            ? {
                                ...prev,
                                variant: { ...prev.variant, hasSkuBarcode: !!checked },
                              }
                            : null,
                        )
                      }
                    />
                    <Label htmlFor="hasSkuBarcode">This product has a SKU or barcode</Label>
                  </div>
                </div>
                {/* Shipping Section */}
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Shipping</h3>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="requiresShipping"
                      checked={editingVariant.variant.requiresShipping}
                      onCheckedChange={(checked) =>
                        setEditingVariant((prev) =>
                          prev
                            ? {
                                ...prev,
                                variant: { ...prev.variant, requiresShipping: !!checked },
                              }
                            : null,
                        )
                      }
                    />
                    <Label htmlFor="requiresShipping">This is a physical product</Label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label>Weight</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={editingVariant.variant.weight || 0}
                        onChange={(e) =>
                          setEditingVariant((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  variant: { ...prev.variant, weight: Number.parseFloat(e.target.value) || 0 },
                                }
                              : null,
                          )
                        }
                        placeholder="0.0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Unit</Label>
                      <Select
                        value={editingVariant.variant.weightUnit || "kg"}
                        onValueChange={(value) =>
                          setEditingVariant((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  variant: { ...prev.variant, weightUnit: value },
                                }
                              : null,
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="g">g</SelectItem>
                          <SelectItem value="lb">lb</SelectItem>
                          <SelectItem value="oz">oz</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                {/* Tax & Status Section */}
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Tax & Status</h3>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="taxable"
                      checked={editingVariant.variant.taxable}
                      onCheckedChange={(checked) =>
                        setEditingVariant((prev) =>
                          prev
                            ? {
                                ...prev,
                                variant: { ...prev.variant, taxable: !!checked },
                              }
                            : null,
                        )
                      }
                    />
                    <Label htmlFor="taxable">Charge tax on this variant</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isActive"
                      checked={editingVariant.variant.isActive}
                      onCheckedChange={(checked) =>
                        setEditingVariant((prev) =>
                          prev
                            ? {
                                ...prev,
                                variant: { ...prev.variant, isActive: !!checked },
                              }
                            : null,
                        )
                      }
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>
                </div>
              </div>
              {/* Image Section */}
              <div className="space-y-4 col-span-2">
                <h3 className="font-medium text-lg">Variant Images</h3>
                {/* Upload Area */}
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-colors"
                  onClick={() => {
                    const input = document.getElementById(`variant-images-${editingVariant.index}`) as HTMLInputElement
                    input?.click()
                  }}
                >
                  <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">{uploading ? "Uploading..." : "Add images for this variant"}</p>
                  <p className="text-xs text-gray-500 mt-1">Click to select multiple images</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  id={`variant-images-${editingVariant.index}`}
                  onChange={(e) => {
                    const files = e.target.files
                    if (files && files.length > 0) {
                      handleVariantImagesUpload(Array.from(files), editingVariant.index)
                    }
                  }}
                />
                {/* Image Grid */}
                {editingVariant.variant.images && editingVariant.variant.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {editingVariant.variant.images.map((image, imageIndex) => (
                      <div key={imageIndex} className="relative group">
                        <div className="aspect-square relative rounded-lg overflow-hidden border">
                          <Image
                            src={image.url || "/placeholder.svg"}
                            alt={image.altText || `Variant image ${imageIndex + 1}`}
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
                              onClick={() => removeVariantImage(editingVariant.index, imageIndex)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          {/* Primary Badge */}
                          {imageIndex === 0 && (
                            <div className="absolute bottom-1 left-1">
                              <span className="bg-blue-600 text-white text-xs px-1 py-0.5 rounded">Primary</span>
                            </div>
                          )}
                        </div>
                        {/* Alt Text Input */}
                        <div className="mt-1">
                          <Input
                            placeholder="Alt text"
                            value={image.altText || ""}
                            onChange={(e) =>
                              updateVariantImageAltText(editingVariant.index, imageIndex, e.target.value)
                            }
                            className="text-xs h-8"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-4 col-span-2">
                <Button type="button" variant="outline" onClick={() => setEditingVariant(null)}>
                  Cancel
                </Button>
                <Button type="button" onClick={saveVariantChanges}>
                  Save Changes
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  )
}
