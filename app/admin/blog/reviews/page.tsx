"use client";

import React, { useCallback } from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";


interface Review {
  _id: string;
  blog_id: {
    _id: string;
    title: string;
  };
  user_id?: {
    _id: string;
    name: string;
  };
  rating: number;
  title: string;
  author_name: string;
  author_email: string;
  is_approved: boolean;
  is_featured: boolean;
  created_at: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function ReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterApproval, setFilterApproval] = useState<string>("all");
  const [pageSize, setPageSize] = useState(10);

 const fetchReviews = useCallback(async () => {
  try {
    setLoading(true);
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: pageSize.toString(),
    });

    if (filterApproval !== "all") params.append("approved", filterApproval);
    if (searchTerm) params.append("search", searchTerm);

    const res = await fetch(`/api/admin/blog/review?${params}`);
    if (res.ok) {
      const data = await res.json();
      setReviews(data.data);
      setPagination(data.pagination);
    } else {
      toast({ title: "Error", description: "Failed to load reviews", variant: "destructive" });
    }
  } catch (err) {
    toast({ title: "Error", description: "Failed to load reviews", variant: "destructive" });
    console.error(err);
  } finally {
    setLoading(false);
  }
}, [currentPage, pageSize, searchTerm, filterApproval]); // dependencies here

useEffect(() => {
  fetchReviews();
}, [fetchReviews]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (value: string) => {
    setFilterApproval(value);
    setCurrentPage(1);
  };



  const ratingColor = {
    1: "bg-red-100 text-red-800",
    2: "bg-orange-100 text-orange-800",
    3: "bg-yellow-100 text-yellow-800",
    4: "bg-blue-100 text-blue-800",
    5: "bg-green-100 text-green-800",
  };

  return (
    <div className="container mx-auto py-4">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blog Reviews</h1>
          <p className="text-gray-600 mt-2">Manage all blog post reviews</p>
        </div>
        <Button onClick={() => router.push("/admin/blog/reviews/add")}>
          Add Review
        </Button>
      </div>

      
      {/* Filters Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-semibold">Search</label>
              <Input
                placeholder="Search by title, author, or blog..."
                value={searchTerm}
                onChange={handleSearch}
                className="mt-2"
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Approval Status</label>
              <Select value={filterApproval} onValueChange={handleFilterChange}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="All reviews" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All reviews</SelectItem>
                  <SelectItem value="true">Approved only</SelectItem>
                  <SelectItem value="false">Pending approval</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-semibold">Per Page</label>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  setPageSize(parseInt(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 per page</SelectItem>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="20">20 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reviews List</CardTitle>
          <CardDescription>
            {pagination && `Total: ${pagination.total} reviews`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No reviews found. {searchTerm && "Try adjusting your search."}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Blog</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Featured</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviews.map((review) => (
                      <TableRow key={review?._id}>
                        <TableCell className="font-medium max-w-xs truncate">
                          {review?.title || "—"}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {review?.blog_id?.title || "—"}
                        </TableCell>
                        <TableCell>
                          <p className="text-sm font-medium">
                            {review?.author_name || "—"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {review?.author_email || "—"}
                          </p>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {review.blog_id?.title}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              ratingColor[
                                review?.rating as keyof typeof ratingColor
                              ] || ""
                            }
                          >
                            {review?.rating || 0}/5
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              review?.is_approved ? "default" : "secondary"
                            }
                          >
                            {review?.is_approved ? "Approved" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {review.is_featured ? (
                            <Badge variant="default">Featured</Badge>
                          ) : (
                            <span className="text-gray-500 text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(review?.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                router.push(
                                  `/admin/blog/reviews/${review?._id}/view`,
                                )
                              }
                            >
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                router.push(
                                  `/admin/blog/reviews/${review._id}/edit`,
                                )
                              }
                            >
                              Edit
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Page {pagination.page} of {pagination.pages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    {Array.from(
                      { length: pagination.pages },
                      (_, i) => i + 1,
                    ).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(pagination.pages, prev + 1),
                        )
                      }
                      disabled={currentPage === pagination.pages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
