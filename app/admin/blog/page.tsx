"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  RefreshCw,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import { debounce } from "lodash";

interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string;
  author: string;
  categories: string[];
  tags: string[];
  published: boolean;
  publish_date: string;
  created_at: string;
  updated_at: string;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Helper: format date
const formatDate = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return isNaN(date.getTime())
    ? "Invalid Date"
    : date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
};

export default function BlogsAdminPage() {
  const { status } = useSession();
  const { toast } = useToast();

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<Blog | null>(null);

  // Fetch blogs
  const fetchBlogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/admin/blog?page=${pagination.page}&limit=${pagination.limit}${
          searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ""
        }`
      );

      if (!response.ok) throw new Error("Failed to fetch blogs");
      const data = await response.json();

      setBlogs(data.blogs || []);
      setPagination(
        data.pagination || { total: 0, page: 1, limit: 10, totalPages: 0 }
      );
    } catch (error) {
      console.error("Error fetching blogs:", error);
      toast({
        title: "Error",
        description: "Failed to fetch blogs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, toast]);

  // ✅ Debounce search to reduce API calls
  const debouncedFetch = useCallback(debounce(fetchBlogs, 400), [fetchBlogs]);

  useEffect(() => {
    if (status === "authenticated") {
      debouncedFetch();
    } else if (status === "unauthenticated") {
      window.location.href = "/login?redirect=/admin/blogs";
    }
  }, [status, pagination.page, pagination.limit, searchTerm, debouncedFetch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchBlogs(); // ✅ call fetch manually
  };

  const handleReset = () => {
    setSearchTerm("");
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchBlogs();
  };

  const handleDeleteClick = (blog: Blog) => {
    setBlogToDelete(blog);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!blogToDelete) return;

    try {
      const response = await fetch(`/api/admin/blog/${blogToDelete.slug}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete blog");

      toast({
        title: "Deleted",
        description: "Blog deleted successfully",
        variant: "destructive",
      });

      fetchBlogs();
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast({
        title: "Error",
        description: "Failed to delete blog",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setBlogToDelete(null);
    }
  };

  return (
    <div className="container mx-auto py-4 space-y-6  ">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Blog Posts</h1>
        <Link href="/admin/blog/add">
          <Button className="bg-black text-white hover:bg-black/80   ">
            <Plus className="h-4 w-4 mr-2" />
            Add New Post
          </Button>
        </Link>
      </div>

      {/* 🔍 Search section */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <Input
            placeholder="Search blogs..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="max-w-md"
          />
          <Button type="submit" variant="outline">
            <Search className="h-4 w-4" />
          </Button>
          <Button type="button" variant="outline" onClick={handleReset}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </form>
      </div>

      {/* 🧾 Blog table */}
      <div className="bg-white rounded-md shadow mt-6 p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-62.5 text-base">Blog Post</TableHead>
              <TableHead className="text-base">Author</TableHead>
              <TableHead className="text-base">Categories</TableHead>
              <TableHead className="text-base">Status</TableHead>
              <TableHead className="text-base">Published Date</TableHead>
              <TableHead className="text-base">Created Date</TableHead>
              <TableHead className="text-base text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex justify-center">
                    <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">Loading blogs...</p>
                </TableCell>
              </TableRow>
            ) : blogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <p className="text-gray-500">No blog posts found</p>
                  <Link
                    href="/admin/blog/add"
                    className="mt-2 inline-block"
                  >
                    <Button variant="link" className="text-amber-700">
                      Create your first blog post
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ) : (
              blogs.map((blog) => (
                <TableRow key={blog._id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 rounded-md overflow-hidden shrink-0">
                        <Image
                          src={blog.featured_image || "/placeholder.svg"}
                          alt={blog.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className="font-medium truncate text-sm"
                          title={blog.title}
                        >
                          {blog.title}
                        </div>
                        <Link
                          href={`/blog/${blog.slug}`}
                          target="_blank"
                          className="text-xs text-black hover:underline"
                        >
                          View Post
                        </Link>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{blog.author}</TableCell>
                  <TableCell>
                    {blog.categories?.length ? (
                      <div className="flex flex-wrap gap-1">
                        {blog.categories.slice(0, 2).map((category, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {category}
                          </Badge>
                        ))}
                        {blog.categories.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{blog.categories.length - 2} more
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">
                        Uncategorized
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={blog.published ? "default" : "secondary"}>
                      {blog.published ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(blog.publish_date)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(blog.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/blog/${blog.slug}`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteClick(blog)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-4 border-t mt-4">
            <div className="text-sm text-gray-500">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              of {pagination.total} results
            </div>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
                disabled={pagination.page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
                disabled={pagination.page === pagination.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Blog Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete “{blogToDelete?.title}”? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
