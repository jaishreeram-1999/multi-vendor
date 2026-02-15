"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Loader2Icon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
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
import { DeleteAlertDialog } from "./_components/delete-alert-dialog";
import Link from "next/link";
import Image from "next/image";
import { Brand, BrandListResponse } from "@/lib/schemas/brands.schema";


export default function BrandsPage(): React.ReactElement {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const limit = 10;
  const { toast } = useToast();

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    brand: Brand | null;
  }>({ open: false, brand: null });

  const fetchBrands = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await axios.get<BrandListResponse>("/api/admin/brands", {
        params: {
          page,
          limit,
          search: searchQuery,
        },
      });
      setBrands(response.data.brands);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      const errorMessage =
        axios.isAxiosError(error) && error.response?.data?.message
          ? String(error.response.data.message)
          : "Failed to fetch brands";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchQuery, toast]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchInput]);

  const handleDelete = async (): Promise<void> => {
    if (!deleteDialog.brand?._id) return;

    try {
      await axios.delete(`/api/admin/brands/${deleteDialog.brand._id}`);
      toast({
        title: "Success",
        description: "Brand deleted successfully",
      });
      fetchBrands();
    } catch (error) {
      const errorMessage =
        axios.isAxiosError(error) && error.response?.data?.message
          ? String(error.response.data.message)
          : "Failed to delete brand";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setDeleteDialog({ open: false, brand: null });
    }
  };

  if (loading && brands.length === 0) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-2">
        <Loader2Icon className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">
          Loading brands...
        </p>
      </div>
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
          
          <div className="mb-4 relative max-w-sm group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />

            <Input
              placeholder="Search brands..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 pr-10"
            />

            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  setSearchQuery("");
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

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
              {brands && brands.length > 0 ? (
                brands.map((brand) => (
                  <TableRow key={brand._id}>
                    <TableCell>
                      {brand.icon ? (
                        <Image
                          src={brand.icon}
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
                      {brand.createdAt
                        ? new Date(brand.createdAt).toLocaleDateString()
                        : "N/A"}
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
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    <p className="text-muted-foreground">No brands found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
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
