"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, Edit2, Plus, Eye, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { ICategory } from "@/types/category.types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CategoriesTableProps {
  categories: ICategory[];
  onDelete: (id: string) => void;
  isLoading?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onFilterChange?: (filters: { search: string; level: string; isActive: string }) => void;
}

export function CategoriesTable({
  categories,
  onDelete,
  isLoading,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onFilterChange,
}: CategoriesTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("");
  const [isActive, setIsActive] = useState("");

  const handleFilterChange = () => {
    onFilterChange?.({ search, level, isActive });
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setIsDeleting(true);

      // 1. Axios call (Agar status 200 hai toh aage badhega)
      const { data } = await axios.delete(`/api/admin/categories/${deleteId}`);

      // 2. Sirf Success wala toast yahan aayega
      toast({
        title: "Success",
        description: data.message, // "Category deleted successfully"
        variant: "success",
      });

      onDelete(deleteId);
      setDeleteId(null);
      router.refresh();
    } catch (err: unknown) {
      console.error(err);

      // Ek line mein error message nikalna (TypeScript safe)
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message
        : "Something went wrong";

      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>Loading categories...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            {/* <CardTitle>Categories</CardTitle> */}
            <CardDescription>
              {categories.length} categor{categories.length !== 1 ? "ies" : "y"}{" "}
              total
            </CardDescription>
          </div>
          <Link href="/admin/categories/add">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Section */}
          <div className="mb-6 space-y-4">
            <div className="flex gap-3 flex-wrap items-end">
              {/* Search Input */}
              <div className="flex-1 min-w-64">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, description, or slug..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 pr-8"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Level Filter */}
              <div className="w-40">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Level
                </label>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="All levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All levels</SelectItem>
                    <SelectItem value="0">Level 0</SelectItem>
                    <SelectItem value="1">Level 1</SelectItem>
                    <SelectItem value="2">Level 2</SelectItem>
                    <SelectItem value="3">Level 3</SelectItem>
                    <SelectItem value="4">Level 4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="w-40">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Status
                </label>
                <Select value={isActive} onValueChange={setIsActive}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Apply Button */}
              <Button onClick={handleFilterChange} variant="default">
                Apply Filters
              </Button>

              {/* Reset Button */}
              <Button
                onClick={() => {
                  setSearch("");
                  setLevel("");
                  setIsActive("");
                  onFilterChange?.({ search: "", level: "", isActive: "" });
                }}
                variant="outline"
              >
                Reset
              </Button>
            </div>
          </div>

          {categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground mb-4">No categories found</p>
              <Link href="/admin/categories/add">
                <Button>Create your first category</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sort Order</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category._id?.toString()}>
                      <TableCell className="font-medium">
                        <div>
                          <p className="text-foreground">{category.name}</p>
                          {category.ancestors &&
                            category.ancestors.length > 0 && (
                              <p className="text-xs text-muted-foreground">
                                {category.ancestors
                                  .map((a) => a.name)
                                  .join(" > ")}
                              </p>
                            )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{category.slug}</TableCell>
                      <TableCell>
                        <Badge variant="outline">Level {category.level}</Badge>
                      </TableCell>
                      <TableCell>
                        {category.isActive ? (
                          <Badge variant="default">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {category.sortOrder}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Link
                            href={`/admin/categories/${category._id?.toString()}`}
                          >
                            <Button
                              size="sm"
                              variant="ghost"
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                          </Link>
                          <Link
                            href={`/admin/categories/${category._id?.toString()}/edit`}
                          >
                            <Button
                              size="sm"
                              variant="ghost"
                              title="Edit category"
                            >
                              <Edit2 className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              setDeleteId(category._id?.toString() || "")
                            }
                            title="Delete category"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPageChange?.(currentPage - 1)}
                      disabled={currentPage === 1 || isLoading}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPageChange?.(currentPage + 1)}
                      disabled={currentPage === totalPages || isLoading}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this category? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-4 justify-end">
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
