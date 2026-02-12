"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

import { useToast } from "@/hooks/use-toast"


interface Blog {
  _id: string
  title: string
  slug: string
  excerpt?: string
}

interface User {
  _id: string
  name: string
  email: string
}


export default function AddReviewPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [blogSearch, setBlogSearch] = useState("")
  const [userSearch, setUserSearch] = useState("")
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])

   const { toast } = useToast();

  const [formData, setFormData] = useState({
    blog_id: "",
    user_id: "",
    rating: "5",
    title: "",
    content: "",
    author_name: "",
    author_email: "",
    is_approved: false,
    is_featured: false,
  })

  useEffect(() => {
    fetchBlogs()
    fetchUsers()
  }, [])

  // Set default user from session
  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        user_id: session.user?.id || "",
        author_name: session.user?.name || "",
        author_email: session.user?.email || "",
      }))
    }
  }, [session])

  useEffect(() => {
    if (blogSearch.trim()) {
      const filtered = blogs.filter(
        (blog) =>
          blog.title.toLowerCase().includes(blogSearch.toLowerCase()) ||
          blog.slug.toLowerCase().includes(blogSearch.toLowerCase())
      )
      setFilteredBlogs(filtered)
    } else {
      setFilteredBlogs(blogs)
    }
  }, [blogSearch, blogs])

  useEffect(() => {
    if (userSearch.trim()) {
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
          user.email.toLowerCase().includes(userSearch.toLowerCase())
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users)
    }
  }, [userSearch, users])

  const fetchBlogs = async () => {
    try {
      const res = await fetch("/api/admin/blog?limit=100")
      if (res.ok) {
        const data = await res.json()
        // console.log(data)
        setBlogs(data.blogs || [])
      }
    } catch (err) {
      console.error("Error fetching blogs:", err)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/blog/review/user")
      if (res.ok) {
        const data = await res.json()
        console.log(data)
        setUsers(data.data || [])
      }
    } catch (err) {
      console.error("Error fetching users:", err)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked  } = e.target as HTMLInputElement
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setLoading(true)

    try {
      // Validation
      if (!formData.blog_id) {
        toast({
          title: "Validation Error",
          description: "Please select a blog",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      if (!formData.author_name.trim()) {
        toast({
          title: "Validation Error",
          description: "Author name is required",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      if (!formData.author_email.trim()) {
        toast({
          title: "Validation Error",
          description: "Author email is required",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      if (!formData.title.trim()) {
        toast({
          title: "Validation Error",
          description: "Review title is required",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      if (!formData.content.trim()) {
        toast({
          title: "Validation Error",
          description: "Review content is required",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      const payload = {
        ...formData,
        rating: parseInt(formData.rating),
        user_id: formData.user_id || null,
      }

      const res = await fetch("/api/admin/blog/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        toast({
          title: "Error",
          description: data.error || "Failed to create review",
          variant: "destructive",
        })
        return
      }
       toast({
          title: "Success",
          description:"Review created successfully!",
          variant: "success",
        })
      
      setTimeout(() => {
        router.push(`/admin/blog/reviews/${data.data._id}/view`)
      }, 1500)
    } catch (err) {
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      })
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create Blog Review</h1>
        <p className="text-gray-600 mt-2">Add a new review for a blog post</p>
      </div>

      <Card className="">
        <CardHeader>
          <CardTitle>Review Details</CardTitle>
          <CardDescription>Fill in the review information below</CardDescription>
        </CardHeader>
        <CardContent>
         

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Blog Selection with Search */}
            <div>
              <Label htmlFor="blog_search">Search & Select Blog *</Label>
              <Input
                id="blog_search"
                placeholder="Search by title or slug..."
                value={blogSearch}
                onChange={(e) => setBlogSearch(e.target.value)}
                className="my-3"
              />
              {formData.blog_id && (
                <Card className="mb-4 bg-blue-50 border-blue-200">
                  <CardContent className="pt-6">
                    <p className="text-sm font-medium text-gray-700">Selected Blog:</p>
                    <p className="text-lg font-semibold mt-1">{blogs.find(b => b._id === formData.blog_id)?.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{blogs.find(b => b._id === formData.blog_id)?.slug}</p>
                  </CardContent>
                </Card>
              )}
              <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-2">
                {filteredBlogs.length > 0 ? (
                  filteredBlogs.map((blog) => (
                    <button
                      key={blog._id}
                      type="button"
                      onClick={() => {
                        handleSelectChange("blog_id", blog._id)
                        setBlogSearch("")
                      }}
                      className={`w-full text-left p-3 rounded-md border transition ${
                        formData.blog_id === blog._id
                          ? "bg-blue-100 border-blue-400"
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <p className="font-medium text-sm">{blog.title}</p>
                      <p className="text-xs text-gray-600">{blog.slug}</p>
                    </button>
                  ))
                ) : blogSearch ? (
                  <p className="text-sm text-gray-500 p-2">No blogs found</p>
                ) : (
                  <p className="text-sm text-gray-500 p-2">Type to search blogs...</p>
                )}
              </div>
            </div>

            {/* User Selection with Search */}
            <div>
              <Label htmlFor="user_search">Search & Select User (Optional)</Label>
              <Input
                id="user_search"
                placeholder="Search by name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="my-3"
              />
              {formData.user_id && (
                <Card className="mb-4 bg-green-50 border-green-200">
                  <CardContent className="pt-6">
                    <p className="text-sm font-medium text-gray-700">Selected User:</p>
                    <p className="text-lg font-semibold mt-1">{users.find(u => u._id === formData.user_id)?.name}</p>
                    <p className="text-xs text-gray-600 mt-1">{users.find(u => u._id === formData.user_id)?.email}</p>
                  </CardContent>
                </Card>
              )}
              <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-2">
                <button
                  key="none"
                  type="button"
                  onClick={() => {
                    handleSelectChange("user_id", "")
                    setUserSearch("")
                  }}
                  className={`w-full text-left p-3 rounded-md border transition ${
                    formData.user_id === ""
                      ? "bg-gray-100 border-gray-400"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <p className="font-medium text-sm">No user</p>
                </button>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <button
                      key={user._id}
                      type="button"
                      onClick={() => {
                        handleSelectChange("user_id", user._id)
                        handleSelectChange("author_name", user.name)
                        handleSelectChange("author_email", user.email)
                        setUserSearch("")
                      }}
                      className={`w-full text-left p-3 rounded-md border transition ${
                        formData.user_id === user._id
                          ? "bg-green-100 border-green-400"
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-gray-600">{user.email}</p>
                    </button>
                  ))
                ) : userSearch ? (
                  <p className="text-sm text-gray-500 p-2">No users found</p>
                ) : (
                  <p className="text-sm text-gray-500 p-2">Type to search users...</p>
                )}
              </div>
            </div>

            {/* Rating */}
            <div>
              <Label htmlFor="rating" className="mb-3">Rating *</Label>
              <Select value={formData.rating} onValueChange={(value) => handleSelectChange("rating", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Poor</SelectItem>
                  <SelectItem value="2">2 - Fair</SelectItem>
                  <SelectItem value="3">3 - Good</SelectItem>
                  <SelectItem value="4">4 - Very Good</SelectItem>
                  <SelectItem value="5">5 - Excellent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Author Name */}
            <div>
              <Label htmlFor="author_name">Author Name *</Label>
              <Input
                id="author_name"
                name="author_name"
                value={formData.author_name}
                onChange={handleChange}
                placeholder="Enter reviewer name"
                className="my-3"
              />
            </div>

            {/* Author Email */}
            <div>
              <Label htmlFor="author_email">Author Email *</Label>
              <Input
                id="author_email"
                name="author_email"
                type="email"
                value={formData.author_email}
                onChange={handleChange}
                placeholder="Enter reviewer email"
                className="my-3"
              />
            </div>

            {/* Review Title */}
            <div>
              <Label htmlFor="title">Review Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter review title"
                className="my-3"
              />
            </div>

            {/* Review Content */}
            <div>
              <Label htmlFor="content">Review Content *</Label>
              <Textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Write your review here"
                rows={6}
                className="my-3"
              />
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_approved"
                  name="is_approved"
                  checked={formData.is_approved}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, is_approved: checked as boolean }))
                  }
                />
                <Label htmlFor="is_approved" className="font-normal cursor-pointer">
                  Approve this review
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="is_featured"
                  name="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, is_featured: checked as boolean }))
                  }
                />
                <Label htmlFor="is_featured" className="font-normal cursor-pointer">
                  Feature this review
                </Label>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Review"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/blog/review")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
