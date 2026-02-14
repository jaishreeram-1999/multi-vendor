"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DeleteAlertDialog } from "@/app/admin/brands/_components/delete-alert-dialog";
import Link from "next/link";
import Image from "next/image";

interface Brand {
  _id: string;
  name: string;
  description: string;
  icon: string;
  isActive: boolean;
  createdAt: string;
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const limit = 10;
  const { toast } = useToast();

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    brand: Brand | null;
  }>({ open: false, brand: null });

  // 1. Ek nayi state add karein local input handle karne ke liye
  const [searchInput, setSearchInput] = useState("");

  // 2. Fetch function mein 'searchQuery' use karein
  const fetchBrands = async () => {
    setLoading(true);
    try {
      // API call mein ab hum searchQuery bhejenge jo button click par update hogi
      const response = await fetch(
        `/api/admin/brands?page=${page}&limit=${limit}&search=${searchQuery}`,
      );
      if (response.ok) {
        const data = await response.json();
        setBrands(data.brands);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch brands",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 3. Search handle karne ka function
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput); // Main state update hogi aur useEffect chalega
    setPage(1); // Search ke baad hamesha page 1 par jayein
  };

  // 4. useEffect waise hi rahega
  useEffect(() => {
    fetchBrands();
  }, [page, searchQuery]);

  const handleDelete = async () => {
    if (!deleteDialog.brand) return;

    try {
      const response = await fetch(
        `/api/admin/brands/${deleteDialog.brand._id}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: "Brand deleted successfully",
        });
        fetchBrands();
      } else {
        throw new Error("Failed to delete brand");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete brand",
        variant: "destructive",
      });
    } finally {
      setDeleteDialog({ open: false, brand: null });
    }
  };

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">Loading...</div>
    );
  }

  return (
    <div className="space-y-6 p-2">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold leading-12">Brands</h1>
          <p className="text-muted-foreground">Manage your product brands</p>
        </div>
        <Button asChild>
          <Link href="/admin/brands/add">
            <Plus className="h-4 w-4 mr-2" />
            Add Brand
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Brands</CardTitle>
          <CardDescription>A list of all brands in your store</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search Section */}
          <form onSubmit={handleSearch} className="mb-4 flex gap-2">
            <input
              type="text"
              placeholder="Search brand name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md w-full max-w-sm text-sm"
            />
            <Button type="submit" variant="default">
              Search
            </Button>
            {/* Clear Button (Optional) */}
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setSearchInput("");
                  setSearchQuery("");
                }}
              >
                Clear
              </Button>
            )}
          </form>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Icon</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBrands?.map((brand) => (
                <TableRow key={brand._id}>
                  <TableCell>
                    {brand.icon ? (
                      <Image
                        src={brand.icon || "/placeholder.svg"}
                        alt={brand.name}
                        width={32}
                        height={32}
                        className="rounded-md"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-200 rounded-md flex items-center justify-center">
                        <ImageIcon className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{brand.name}</TableCell>
                  <TableCell>{brand.description}</TableCell>
                  <TableCell>
                    <Badge variant={brand.isActive ? "default" : "secondary"}>
                      {brand.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(brand.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/brands/${brand._id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteDialog({ open: true, brand })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          {/* {brands.length > 10 &&( */}
          <div className="mt-4 flex justify-between items-center">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            >
              Next
            </Button>
          </div>
          {/* )}  */}
        </CardContent>
      </Card>

      <DeleteAlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, brand: null })}
        onConfirm={handleDelete}
        title="Delete Brand"
        description={`Are you sure you want to delete "${deleteDialog.brand?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}
