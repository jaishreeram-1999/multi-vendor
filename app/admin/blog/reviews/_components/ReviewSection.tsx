"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Review {
  _id: string
  blog_id: string
  rating: number
  title: string
  content: string
  author_name: string
  author_email: string
  is_approved: boolean
  is_featured: boolean
  helpful_count: number
  unhelpful_count: number
  created_at: string
  updated_at: string
}

interface ReviewSectionProps {
  blogId: string
  maxReviews?: number
}

export function ReviewSection({ blogId, maxReviews = 5 }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

 
useEffect(() => {
  const fetchReviews = async () => {
    try {
      setLoading(true)
      const res = await fetch(
        `/api/blog/review?blog_id=${blogId}&page=${page}&limit=${maxReviews}&approved=true`
      )
      if (res.ok) {
        const data = await res.json()
        setReviews(data.data.filter((review: Review) => review.is_approved))
        setTotalPages(data.pagination.pages)
      } else {
        setError("Failed to load reviews")
      }
    } catch (err) {
      setError("Error loading reviews")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  fetchReviews()
}, [blogId, page, maxReviews])

  const handleHelpful = async (reviewId: string, type: "helpful" | "unhelpful") => {
    try {
      const res = await fetch(`/api/blog/review/${reviewId}/helpful`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      })

      if (res.ok) {
        const data = await res.json()
        // Update the review in the list
        setReviews((prev) =>
          prev.map((review) =>
            review._id === reviewId ? data.data : review,
          ),
        )
      }
    } catch (err) {
      console.error("Error updating helpful count:", err)
    }
  }

  const getRatingColor = (rating: number) => {
    switch (rating) {
      case 1:
        return "bg-red-100 text-red-800"
      case 2:
        return "bg-orange-100 text-orange-800"
      case 3:
        return "bg-yellow-100 text-yellow-800"
      case 4:
        return "bg-blue-100 text-blue-800"
      case 5:
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (error) {
    return (
      <Alert className="border-red-500 bg-red-50">
        <AlertDescription className="text-red-800">{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Reviews</h2>
        <p className="text-gray-600">
          {reviews.length === 0 ? "No reviews yet" : `${reviews.length} review${reviews.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No reviews available for this post yet.
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review._id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{review.title}</CardTitle>
                        {review.is_featured && (
                          <Badge variant="default">Featured</Badge>
                        )}
                      </div>
                      <CardDescription>
                        By {review.author_name}
                        {review.author_email && (
                          <span className="text-xs ml-2">({review.author_email})</span>
                        )}
                      </CardDescription>
                    </div>
                    <Badge className={getRatingColor(review.rating)}>
                      {review.rating}/5 ⭐
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {review.content}
                  </p>

                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500">
                      {new Date(review.created_at).toLocaleDateString(
                        undefined,
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </span>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleHelpful(review._id, "helpful")}
                      >
                        👍 Helpful ({review.helpful_count})
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleHelpful(review._id, "unhelpful")}
                      >
                        👎 Unhelpful ({review.unhelpful_count})
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <Button
                      key={p}
                      variant={page === p ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </Button>
                  ),
                )}
              </div>
              <Button
                variant="outline"
                onClick={() =>
                  setPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
