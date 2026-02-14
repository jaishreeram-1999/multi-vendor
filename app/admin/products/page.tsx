"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Plus,
  Edit,
  Trash2,
  ImageIcon,
  Eye,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
  Search,
  MoreHorizontal,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DeleteAlertDialog } from "./_components/delete-alert-dialog"
import Link from "next/link"
import Image from "next/image"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Loader2 } from "lucide-react"

interface Product {
  _id: string
  title: string
  description: string
  status: string
  productType: string
  vendor: string
  category: {
    _id: string
    name: string
  }
  brand: {
    _id: string
    name: string
  }
  variants: Array<{
    price: number
    inventoryQuantity: number
  }>
  images: Array<{
    url: string
    altText: string
  }>
  createdAt: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid") // Default to grid for better mobile experience
  const [nameFilter, setNameFilter] = useState("")
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; product: Product | null }>({
    open: false,
    product: null,
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { toast } = useToast()

  const fetchProducts = async (page = 1) => {
  try {
    setLoading(true)
    const res = await fetch(`/api/admin/products?page=${page}&per_page=10`)
    const data = await res.json()
    
    // Agar data.products nahi milta toh empty array [] bhejien
    setProducts(data.products || []) 
    setTotalPages(data.totalPages || 1)
    setCurrentPage(page)
  } catch (error) {
    setProducts([]) // Error aane par empty array set karein taaki filter crash na ho
    toast({
      title: "Error",
      description: "Failed to fetch products",
      variant: "destructive",
    })
  } finally {
    setLoading(false)
  }
}

 useEffect(() => {

  if (!nameFilter.trim()) {
    setFilteredProducts(products || [])
  } else {
    const filtered = (products || []).filter((product) => 
      product?.title?.toLowerCase().includes(nameFilter.toLowerCase())
    )
    setFilteredProducts(filtered)
  }
}, [products, nameFilter])

  const handleDelete = async () => {
    if (!deleteDialog.product) return

    try {
      const response = await fetch(`/api/admin/products/${deleteDialog.product._id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({ title: "Success", description: "Product deleted successfully" })
        fetchProducts(currentPage)
      } else {
        throw new Error()
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      })
    } finally {
      setDeleteDialog({ open: false, product: null })
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

 if (loading) return <Loader2 className="animate-spin" />
  return (
    <div className="space-y-4 sm:space-y-6 px-2 py-4 ">
      {" "}
      {/* Responsive padding and spacing */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Products</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage your product catalog</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
          <Button asChild variant="outline" className="w-full sm:w-auto bg-transparent">
            <Link href="/admin/products/all">
              <Grid3X3 className="h-4 w-4 mr-2" />
              View All
            </Link>
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/admin/products/add">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Link>
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg sm:text-xl">Recent Products</CardTitle>
              <CardDescription className="text-sm">Your latest products and their status</CardDescription>
            </div>
            <div className="flex gap-2 self-start sm:self-auto">
              <Button
                variant={viewMode === "table" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="flex-1 sm:flex-none"
              >
                <List className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Table</span>
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="flex-1 sm:flex-none"
              >
                <Grid3X3 className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Grid</span>
              </Button>
            </div>
          </div>

          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Filter by product name..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0 sm:p-6">
          {viewMode === "table" ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Image</TableHead>
                    <TableHead className="min-w-50">Product</TableHead>
                    <TableHead className="hidden sm:table-cell">Status</TableHead>
                    <TableHead className="hidden md:table-cell">Inventory</TableHead>
                    <TableHead className="hidden lg:table-cell">Type</TableHead>
                    <TableHead className="hidden lg:table-cell">Vendor</TableHead>
                    <TableHead className="text-right w-24 sm:w-32">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts?.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell className="p-2 sm:p-4">
                        {product.images?.[0] ? (
                          <Image
                            src={product.images[0].url || "/placeholder.svg"}
                            alt={
                              (product.images[0].altText || product.title)?.length > 30
                                ? (product.images[0].altText || product.title).slice(0, 30) + "..."
                                : product.images[0].altText || product.title
                            }
                            width={32}
                            height={32}
                            className="rounded-md object-cover sm:w-10 sm:h-10"
                          />
                        ) : (
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-md flex items-center justify-center">
                            <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="p-2 sm:p-4">
                        <div className="space-y-1">
                          <div className="font-medium text-sm sm:text-base truncate max-w-[250px] sm:max-w-[350px] lg:max-w-[500px]">
                            {product.title}
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground truncate max-w-[120px] sm:max-w-[150px]">
                            {product.category?.name} {product.brand?.name}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell p-2 sm:p-4">
                        <Badge
                          variant={
                            product.status === "active"
                              ? "default"
                              : product.status === "draft"
                                ? "secondary"
                                : "outline"
                          }
                          className="text-xs"
                        >
                          {product.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell p-2 sm:p-4 text-sm">
                        {product.variants?.reduce((t, v) => t + v.inventoryQuantity, 0) || 0} in stock
                      </TableCell>
                      <TableCell className="hidden lg:table-cell p-2 sm:p-4 text-sm">
                        {product.productType || "—"}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell p-2 sm:p-4 text-sm">{product.vendor || "—"}</TableCell>
                      <TableCell className="text-right p-2 sm:p-4">
                        <div className="flex justify-end">
                          <div className="hidden sm:flex gap-1">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/admin/products/${product._id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/admin/products/${product._id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setDeleteDialog({ open: true, product })}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="sm:hidden">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/admin/products/${product._id}`}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/admin/products/${product._id}/edit`}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setDeleteDialog({ open: true, product })}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 sm:p-0">
              {filteredProducts?.map((product) => (
                <Card key={product._id} className="group hover:shadow-md transition-shadow">
                  <CardContent className="p-3 sm:p-4">
                    <div className="aspect-square relative overflow-hidden rounded-lg mb-3">
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0].url || "/placeholder.svg"}
                          alt={
                            (product.images[0].altText || product.title)?.length > 30
                              ? (product.images[0].altText || product.title).slice(0, 27) + "..."
                              : product.images[0].altText || product.title
                          }
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-sm sm:text-base line-clamp-2 flex-1">{product.title}</h3>
                        <Badge
                          variant={
                            product.status === "active"
                              ? "default"
                              : product.status === "draft"
                                ? "secondary"
                                : "outline"
                          }
                          className="text-xs shrink-0"
                        >
                          {product.status}
                        </Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">
                          {product.variants?.reduce((t, v) => t + v.inventoryQuantity, 0) || 0} in stock
                        </span>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                            <Link href={`/admin/products/${product._id}`}>
                              <Eye className="h-3 w-3" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                            <Link href={`/admin/products/${product._id}/edit`}>
                              <Edit className="h-3 w-3" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setDeleteDialog({ open: true, product })}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredProducts?.length === 0 && nameFilter && (
            <div className="text-center py-8 px-4">
              <p className="text-sm sm:text-base text-muted-foreground">No products found matching "{nameFilter}"</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-center items-center mt-6 gap-4 px-4 sm:px-0">
              <div className="flex gap-2 flex-wrap justify-center">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fetchProducts(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline ml-1">Previous</span>
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    if (totalPages <= 5) return true
                    if (page === 1 || page === totalPages) return true
                    if (page >= currentPage - 1 && page <= currentPage + 1) return true
                    return false
                  })
                  .map((page, index, array) => (
                    <div key={page} className="flex items-center gap-2">
                      {index > 0 && array[index - 1] !== page - 1 && <span className="text-muted-foreground">...</span>}
                      <Button
                        size="sm"
                        variant={page === currentPage ? "default" : "outline"}
                        onClick={() => fetchProducts(page)}
                        className="h-8 w-8 p-0 sm:h-9"
                      >
                        {page}
                      </Button>
                    </div>
                  ))}

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fetchProducts(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
                >
                  <span className="hidden sm:inline mr-1">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="text-xs sm:text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <DeleteAlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, product: null })}
        onConfirm={handleDelete}
        title="Delete Product"
        description={`Are you sure you want to delete "${deleteDialog.product?.title}"? This action cannot be undone.`}
      />
    </div>
  )
}
