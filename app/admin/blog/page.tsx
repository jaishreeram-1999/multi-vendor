'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import axios, { AxiosError } from 'axios'
import { Plus, Edit, Trash2, Search, RefreshCw, MoreHorizontal, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { useSession } from 'next-auth/react'
import { type BlogsListResponse, type BlogApiResponse } from '@/lib/schemas/blog.schema'

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return isNaN(date.getTime())
    ? 'Invalid Date'
    : date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
}

const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
) => {
  let timeout: NodeJS.Timeout | null = null

  const debounced = (...args: unknown[]) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      func(...args)
      timeout = null
    }, wait)
  }

  debounced.cancel = () => {
    if (timeout) clearTimeout(timeout)
    timeout = null
  }

  return debounced as T & { cancel: () => void }
}

export default function BlogsAdminPage() {
  const router = useRouter()
  const { status } = useSession()
  const { toast } = useToast()

  const [blogs, setBlogs] = useState<BlogApiResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [blogToDelete, setBlogToDelete] = useState<BlogApiResponse | null>(null)

  const fetchBlogs = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data } = await axios.get<BlogsListResponse>('/api/admin/blog', {
        params: {
          page,
          limit,
          ...(searchTerm && { search: searchTerm }),
        },
      })

      setBlogs(data.blogs)
      setTotal(data.pagination.total)
      setTotalPages(data.pagination.totalPages)
    } catch (error) {
      console.error('Error fetching blogs:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch blogs',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [page, limit, searchTerm, toast])

  const debouncedFetch = useMemo(
    () =>
      debounce(() => {
        fetchBlogs()
      }, 400),
    [fetchBlogs],
  )

  useEffect(() => {
    return () => {
      debouncedFetch.cancel()
    }
  }, [debouncedFetch])

  useEffect(() => {
    if (status === 'authenticated') {
      debouncedFetch()
    } else if (status === 'unauthenticated') {
      router.push('/login?redirect=/admin/blog')
    }
  }, [status, page, searchTerm, debouncedFetch, router])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    debouncedFetch()
  }

  const handleReset = () => {
    setSearchTerm('')
    setPage(1)
    debouncedFetch()
  }

  const handleDeleteClick = (blog: BlogApiResponse) => {
    setBlogToDelete(blog)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!blogToDelete) return

    try {
      await axios.delete(`/api/admin/blog/${blogToDelete.slug}`)

      toast({
        title: 'Deleted',
        description: 'Blog deleted successfully',
      })

      fetchBlogs()
    } catch (error) {
      console.error('Error deleting blog:', error)
      const axiosError = error as AxiosError<{ message?: string }>
      const message =
        axiosError.response?.data?.message || 'Failed to delete blog'
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      })
    } finally {
      setDeleteDialogOpen(false)
      setBlogToDelete(null)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Blog Posts</h1>
        <Link href="/admin/blog/add">
          <Button className="bg-teal-600 hover:bg-teal-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add New Post
          </Button>
        </Link>
      </div>

      {/* Search section */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <Input
            placeholder="Search blogs by title, author, or slug..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setPage(1)
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

      {/* Blog table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Blog Post</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Categories</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Published</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400 mx-auto" />
                  <p className="mt-2 text-sm text-gray-500">Loading blogs...</p>
                </TableCell>
              </TableRow>
            ) : blogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <p className="text-gray-500">No blog posts found</p>
                  <Link href="/admin/blog/create" className="mt-2 inline-block">
                    <Button variant="link" className="text-teal-600">
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
                      <div className="relative h-12 w-12 rounded overflow-hidden shrink-0">
                        <Image
                          src={blog.featured_image || '/placeholder.svg'}
                          alt={blog.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate text-sm">
                          {blog.title}
                        </div>
                        <Link
                          href={`/blog/${blog.slug}`}
                          target="_blank"
                          className="text-xs text-teal-600 hover:underline"
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
                            +{blog.categories.length - 2}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">Uncategorized</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={blog.published ? 'default' : 'secondary'}>
                      {blog.published ? 'Published' : 'Draft'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{formatDate(blog.publish_date)}</TableCell>
                  <TableCell className="text-sm">{formatDate(blog.created_at)}</TableCell>
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
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <div className="text-sm text-gray-500">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of{' '}
              {total} results
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
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
              Are you sure you want to delete &apos;{blogToDelete?.title}&apos; blog ? This action
              cannot be undone.
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
  )
}
