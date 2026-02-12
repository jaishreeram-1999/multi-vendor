"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter,useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

interface Blog {
  _id: string
  title: string
  slug: string
  content?: string
}

interface User {
  _id: string
  name: string
  email: string
}

interface Review {
  _id: string
  blog_id: Blog
  user_id?: User
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
export default function ViewReviewPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [review, setReview] = useState<Review | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  const {toast} = useToast()

const fetchReview = useCallback(async (id: string) => {
  try {
    setLoading(true);
    const res = await fetch(`/api/admin/blog/review/${id}`);
    if (res.ok) {
      const data = await res.json();
      console.log(data.data);
      setReview(data.data);
    } else {
      setError("Review not found");
    }
  } catch (err: unknown) {
    setError("Failed to load review");
    console.error(err);
  } finally {
    setLoading(false);
  }
}, []);

useEffect(() => {
  if (!id) return;
  fetchReview(id);
}, [id, fetchReview]);

  const handleDelete = async () => {
    try {
      setActionLoading(true)
      const res = await fetch(`/api/admin/blog/review/${id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast({
          title: "Success",
          description: "Review deleted successfully",
          variant: "destructive",
        })
        router.push("/admin/blog/reviews")
      } else {
        toast({
          title: "Error",
          description: "Failed to delete review",
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete review",
        variant: "destructive",
      })
      console.error(err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleToggleApprove = async () => {
    if (!review) return

    try {
      setActionLoading(true)
      const res = await fetch(`/api/admin/blog/review/${params.id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_approved: !review.is_approved }),
      })

      if (res.ok) {
        const data = await res.json()
        toast({
          title: "Success",
          description: "Approval status updated successfully",
          variant: "default",
        })
        setReview(data.data)
      } else {
        toast({
          title: "Error",
          description: "Failed to update approval status",
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update approval status",
        variant: "destructive",
      })
      console.error(err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleHelpful = async (type: "helpful" | "unhelpful") => {
    if (!review) return

    try {
      setActionLoading(true)
      const res = await fetch(`/api/admin/blog/review/${params.id}/helpful`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      })

      if (res.ok) {
        const data = await res.json()
        toast({
          title: "Success",
          description: "Helpful count updated successfully",
          variant: "default",
        })
        setReview(data.data)
      } else {
        toast({
          title: "Error",
          description: "Failed to update helpful count",
          variant: "destructive",
        })
      }
    } catch (err) {
     toast({
       title: "Error",
       description: "Failed to update helpful count",
       variant: "destructive",
     })
      console.error(err)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading review...</div>
      </div>
    )
  }

  if (error || !review) {
    return (
      <div className="container mx-auto py-8">
        <Alert className="border-red-500 bg-red-50">
          <AlertDescription className="text-red-800">{error || "Review not found"}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push("/admin/blog/review")} className="mt-4">
          Back to Reviews
        </Button>
      </div>
    )
  }

  const ratingColor = {
    1: "bg-red-100 text-red-800",
    2: "bg-orange-100 text-orange-800",
    3: "bg-yellow-100 text-yellow-800",
    4: "bg-blue-100 text-blue-800",
    5: "bg-green-100 text-green-800",
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{review.title}</h1>
          <p className="text-gray-600 mt-2">Review Details & Information</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>

      {error && (
        <Alert className="mb-4 border-red-500 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        {/* Main Review Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle>{review.title}</CardTitle>
                <CardDescription>
                  By {review.author_name} ({review.author_email})
                </CardDescription>
              </div>
              <Badge className={ratingColor[review.rating as keyof typeof ratingColor]}>
                Rating: {review.rating}/5
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Review Content</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{review.content}</p>
            </div>
          </CardContent>
        </Card>

        {/* Related Blog Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">Related Blog Post</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <label className="font-semibold text-sm text-gray-700">Title:</label>
                <p className="text-gray-900 font-medium mt-1">{review.blog_id.title}</p>
              </div>
              <div>
                <label className="font-semibold text-sm text-gray-700">Slug:</label>
                <p className="text-gray-700 text-sm mt-1">{review.blog_id.slug}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Information Card (if linked to user) */}
        {review.user_id && (
          <Card>
            <CardHeader>
              <CardTitle>Associated User</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <label className="font-semibold text-sm">Name:</label>
                <p className="text-gray-700">{review.user_id.name}</p>
              </div>
              <div>
                <label className="font-semibold text-sm">Email:</label>
                <p className="text-gray-700">{review.user_id.email}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status & Statistics Card */}
        <Card>
          <CardHeader>
            <CardTitle>Status & Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-sm">Approval Status:</label>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant={review.is_approved ? "default" : "secondary"}>
                    {review.is_approved ? "Approved" : "Pending"}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleToggleApprove}
                    disabled={actionLoading}
                  >
                    {review.is_approved ? "Unapprove" : "Approve"}
                  </Button>
                </div>
              </div>
              <div>
                <label className="font-semibold text-sm">Featured:</label>
                <div className="mt-2">
                  <Badge variant={review.is_featured ? "default" : "secondary"}>
                    {review.is_featured ? "Featured" : "Not Featured"}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-sm">Helpful Count:</label>
                <p className="text-2xl font-bold text-green-600 mt-1">{review.helpful_count}</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleHelpful("helpful")}
                  disabled={actionLoading}
                  className="mt-2"
                >
                  Add Helpful
                </Button>
              </div>
              <div>
                <label className="font-semibold text-sm">Unhelpful Count:</label>
                <p className="text-2xl font-bold text-red-600 mt-1">{review.unhelpful_count}</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleHelpful("unhelpful")}
                  disabled={actionLoading}
                  className="mt-2"
                >
                  Add Unhelpful
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metadata Card */}
        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-semibold">Created At:</label>
                <p className="text-gray-600">{new Date(review.created_at).toLocaleString()}</p>
              </div>
              <div>
                <label className="font-semibold">Updated At:</label>
                <p className="text-gray-600">{new Date(review.updated_at).toLocaleString()}</p>
              </div>
            </div>
            <div>
              <label className="font-semibold">Review ID:</label>
              <p className="text-gray-600 font-mono text-xs break-all">{review._id}</p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button onClick={() => router.push(`/admin/blog/reviews/${params.id}/edit`)}>
            Edit Review
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={actionLoading}>
                Delete Review
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogTitle>Delete Review</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this review? This action cannot be undone.
              </AlertDialogDescription>
              <div className="flex gap-3">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600">
                  Delete
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            variant="outline"
            onClick={() => router.push("/admin/blog/reviews")}
          >
            Back to Reviews
          </Button>
        </div>
      </div>
    </div>
  )
}
