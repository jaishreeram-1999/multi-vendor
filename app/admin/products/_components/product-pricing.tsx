"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ProductPricingProps {
  price: number
  compareAtPrice?: number
  taxable: boolean
  costPerItem?: number
  sku: string
  barcode: string
  inventoryQuantity: number
  trackQuantity: boolean
  continueSellingWhenOutOfStock: boolean
  hasSkuBarcode: boolean // New prop for controlling SKU/Barcode visibility
  onPriceChange: (value: number) => void
  onCompareAtPriceChange: (value?: number) => void
  onTaxableChange: (checked: boolean) => void
  onCostPerItemChange: (value?: number) => void
  onSkuChange: (value: string) => void
  onBarcodeChange: (value: string) => void
  onInventoryQuantityChange: (value: number) => void
  onTrackQuantityChange: (checked: boolean) => void
  onContinueSellingWhenOutOfStockChange: (checked: boolean) => void
  onHasSkuBarcodeChange: (checked: boolean) => void // New handler
}

export function ProductPricing({
  price,
  compareAtPrice,
  taxable,
  costPerItem,
  sku,
  barcode,
  inventoryQuantity,
  trackQuantity,
  continueSellingWhenOutOfStock,
  hasSkuBarcode, // Destructure new prop
  onPriceChange,
  onCompareAtPriceChange,
  onTaxableChange,
  onCostPerItemChange,
  onSkuChange,
  onBarcodeChange,
  onInventoryQuantityChange,
  onTrackQuantityChange,
  onContinueSellingWhenOutOfStockChange,
  onHasSkuBarcodeChange, // Destructure new handler
}: ProductPricingProps) {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => onPriceChange(Number.parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="compareAtPrice" className="flex items-center gap-1">
                Compare-at price
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>To show a reduced price, enter an original price higher than your current price.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                <Input
                  id="compareAtPrice"
                  type="number"
                  step="0.01"
                  value={compareAtPrice || ""}
                  onChange={(e) =>
                    onCompareAtPriceChange(e.target.value ? Number.parseFloat(e.target.value) : undefined)
                  }
                  placeholder="0.00"
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="costPerItem">Cost per item</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                <Input
                  id="costPerItem"
                  type="number"
                  step="0.01"
                  value={costPerItem || ""}
                  onChange={(e) => onCostPerItemChange(e.target.value ? Number.parseFloat(e.target.value) : undefined)}
                  placeholder="0.00"
                  className="pl-8"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="chargeTax" checked={taxable} onCheckedChange={(checked) => onTaxableChange(!!checked)} />
            <Label htmlFor="chargeTax">Charge tax on this product</Label>
          </div>
        </CardContent>
      </Card>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Inventory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="trackQuantity"
              checked={trackQuantity}
              onCheckedChange={(checked) => onTrackQuantityChange(!!checked)}
            />
            <Label htmlFor="trackQuantity">Track quantity</Label>
          </div>

          {trackQuantity && (
            <div className="space-y-2">
              <Label htmlFor="inventoryQuantity">Quantity</Label>
              <div className="flex items-center gap-2">
                <Label className="text-sm text-muted-foreground">Shop location</Label>
                <Input
                  id="inventoryQuantity"
                  type="number"
                  value={inventoryQuantity}
                  onChange={(e) => onInventoryQuantityChange(Number.parseInt(e.target.value) || 0)}
                  className="w-24"
                />
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="continueSellingWhenOutOfStock"
              checked={continueSellingWhenOutOfStock}
              onCheckedChange={(checked) => onContinueSellingWhenOutOfStockChange(!!checked)}
            />
            <Label htmlFor="continueSellingWhenOutOfStock">Continue selling when out of stock</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasSkuBarcode"
              checked={hasSkuBarcode} // Controlled by new prop
              onCheckedChange={(checked) => {
                onHasSkuBarcodeChange(!!checked) // Update the new prop
                if (!checked) {
                  onSkuChange("") // Clear SKU if unchecked
                  onBarcodeChange("") // Clear Barcode if unchecked
                }
              }}
            />
            <Label htmlFor="hasSkuBarcode">This product has a SKU or barcode</Label>
          </div>

          {hasSkuBarcode && ( // Conditionally render based on new prop
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
                <Input id="sku" value={sku} onChange={(e) => onSkuChange(e.target.value)} placeholder="SKU" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="barcode">Barcode (ISBN, UPC, GTIN, etc.)</Label>
                <Input
                  id="barcode"
                  value={barcode}
                  onChange={(e) => onBarcodeChange(e.target.value)}
                  placeholder="Barcode"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
