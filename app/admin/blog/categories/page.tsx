"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

interface BlogCategory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  created_at: string;
}

const ITEMS_PER_PAGE = 10;

export default function CategoriesPage() {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCategories, setTotalCategories] = useState(0);

  const totalPages = Math.ceil(totalCategories / ITEMS_PER_PAGE);

  //alert delete
  const [openDialog, setOpenDialog] = useState(false);
  const [slugToDelete, setSlugToDelete] = useState<string | null>(null);

  // Fetch categories with pagination support
  const fetchCategories = async (page: number = 1) => {
    setLoading(true);

    try {
      // If your backend supports pagination, use query params
      // const res = await fetch(`/api/admin/blog/categories?page=${page}&limit=${ITEMS_PER_PAGE}`);

      // For now - fetching all (common in small/medium admin panels)
      const res = await fetch("/api/admin/blog/categories");

      if (!res.ok) throw new Error(`Failed to fetch (status ${res.status})`);

      const data = await res.json();
      const allCategories = data.blogcategories || [];

      setTotalCategories(allCategories.length);
      // Slice for current page
      const start = (page - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      setCategories(allCategories.slice(start, end));
    } catch (err: unknown) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load categories",
        variant: "destructive",
      })
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories(currentPage);
  }, [currentPage]);

  // Step 1: Open dialog
  const handleDeleteClick = (slug: string) => {
    setSlugToDelete(slug);
    setOpenDialog(true);
  };

  // Step 2: Confirm deletion
  const handleConfirmDelete = async () => {
    if (!slugToDelete) return;

    setDeletingSlug(slugToDelete);
    

    try {
      const res = await fetch(`/api/admin/blog/categories/${slugToDelete}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data.error || `Failed to delete (status ${res.status})`,
        );
      }

      setCategories((prev) => prev.filter((cat) => cat.slug !== slugToDelete));
      setTotalCategories((prev) => prev - 1);

      if (categories.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }
      toast({
        title: "Success",
        description: "Category deleted successfully",
        variant: "destructive",
      })
    } catch (err: unknown) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete category",
        variant: "destructive",
      })
    } finally {
      setDeletingSlug(null);
      setOpenDialog(false);
      setSlugToDelete(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="container mx-auto py-5">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Blog Categories</h1>
        <Link
          href="/admin/blog/categories/add"
          className="bg-black text-white px-5 py-2.5 rounded-lg hover:bg-black/80 transition font-medium"
        >
          + Add New Category
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">
          Loading categories...
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No blog categories found
        </div>
      ) : (
        <>
          <div className="overflow-x-auto border rounded-lg shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Slug
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Description
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                    Active
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {cat.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                      {cat.slug}
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-md overflow-hidden whitespace-nowrap text-ellipsis">
                      {cat.description || (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {cat.isActive ? (
                        <span className="text-green-600 font-semibold">
                          Yes
                        </span>
                      ) : (
                        <span className="text-red-600 font-semibold">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-6">
                        <Link
                          href={`/admin/blog/categories/${cat.slug}`}
                          className="text-blue-600 hover:text-blue-800 font-medium transition"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(cat.slug)}
                          disabled={deletingSlug === cat.slug}
                          className={`font-medium transition ${
                            deletingSlug === cat.slug
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-red-600 hover:text-red-800"
                          }`}
                        >
                          {deletingSlug === cat.slug ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-4 py-2 border rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Page <strong>{currentPage}</strong> of{" "}
                  <strong>{totalPages}</strong>
                </span>
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-4 py-2 border rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>

        
      )}
      
       {/* AlertDialog ko yaha rakh do */}
    <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete blog category &quot;{slugToDelete}&quot;?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </div>
  );
}
