"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Save, Trash, Upload, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

interface BlogData {
  _id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  author: string;
  categories: string[];
  tags: string[];
  published: boolean;
  publish_date: string;
  meta_title: string;
  meta_description: string;
}

interface Category {
  _id: string;
  name: string;
}

export default function BlogEditPage() {
  const params = useParams();
  const slugFromUrl = Array.isArray(params.slug)
    ? params.slug[0]
    : (params.slug as string);

  const router = useRouter();
  const { status } = useSession();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [originalSlug, setOriginalSlug] = useState<string>("");
  const [blogData, setBlogData] = useState<BlogData>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featured_image: "",
    author: "",
    categories: [],
    tags: [],
    published: false,
    publish_date: "",
    meta_title: "",
    meta_description: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [newTag, setNewTag] = useState("");
  const [existingCategories, setExistingCategories] = useState<Category[]>([]);
  const [existingTags] = useState<string[]>([]);

  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchBlog = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/admin/blog/${slugFromUrl}`);
        if (!response.ok) {
          if (response.status === 404) {
            toast({
              title: "Not Found",
              description: "Blog post not found",
              variant: "destructive",
            });
            router.push("/admin/blog");
            return;
          }
          throw new Error(`Failed to fetch blog: ${response.status}`);
        }

        const blog = await response.json();

        setBlogData({
          ...blog,
          publish_date: blog.publish_date
            ? new Date(blog.publish_date).toISOString().split("T")[0]
            : "",
        });

        setOriginalSlug(blog.slug);
        setImagePreview(blog.featured_image || "");
      } catch (error) {
        console.error("Error fetching blog:", error);
        toast({
          title: "Error",
          description: "Failed to load blog post",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    const fetchCategoriesAndTags = async () => {
      try {
        const res = await fetch("/api/admin/blog/categories");
        if (res.ok) {
          const { blogcategories } = await res.json();
          setExistingCategories(blogcategories || []);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };

    fetchBlog();
    fetchCategoriesAndTags();
  }, [slugFromUrl, status, router, toast]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setBlogData((prev) => {
      const updated = { ...prev, [name]: value };

      if (
        name === "title" &&
        (!prev.slug.trim() ||
          prev.slug ===
            prev.title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, ""))
      ) {
        const newSlug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
        updated.slug = newSlug;
      }

      return updated;
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      toast({
        title: "Image selected",
        description: "Don't forget to save to upload the image",
      });
    }
  };

  const handleAddTag = () => {
    const trimmed = newTag.trim();
    if (trimmed && !blogData.tags.includes(trimmed)) {
      setBlogData((prev) => ({
        ...prev,
        tags: [...prev.tags, trimmed],
      }));
      setNewTag("");
    }
  };

  const handleRemoveCategory = (categoryName: string) => {
    setBlogData((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c !== categoryName),
    }));
  };

  const handleRemoveTag = (tag: string) => {
    setBlogData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const requiredFields = ["title", "slug", "excerpt", "content", "author"];
      for (const field of requiredFields) {
        if (!blogData[field as keyof BlogData]?.toString().trim()) {
          toast({
            title: "Validation Error",
            description: `${field.charAt(0).toUpperCase() + field.slice(1)} is required`,
            variant: "destructive",
          });
          return;
        }
      }

      if (!blogData.featured_image && !imageFile) {
        toast({
          title: "Validation Error",
          description: "Featured image is required",
          variant: "destructive",
        });
        return;
      }

      let imageUrl = blogData.featured_image;

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);

        const uploadResponse = await fetch("/api/admin/upload-image", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload image");
        }

        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.url;
      }

      const dataToSubmit = {
        ...blogData,
        featured_image: imageUrl,
      };

      const response = await fetch(`/api/admin/blog/${originalSlug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSubmit),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update blog");
      }

      toast({
        title: "Success",
        description: "Blog updated successfully",
        variant: "success",
      });

      if (blogData.slug !== originalSlug) {
        router.push(`/admin/blog/${blogData.slug}`);
        setOriginalSlug(blogData.slug);
      } else {
        router.push("/admin/blog");
      }
    } catch (error: unknown) {
      console.error("Error saving blog:", error);

      let message = "Failed to save blog";
      if (error instanceof Error) {
        message = error.message;
      }

      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // const handleDelete = async () => {

  //   try {
  //     const response = await fetch(`/api/admin/blog/${originalSlug}`, {
  //       method: "DELETE",
  //     });

  //     if (!response.ok) throw new Error("Failed to delete blog");

  //     toast({
  //       title: "Success",
  //       description: "Blog deleted successfully",
  //     });

  //     router.push("/admin/blog");
  //   } catch (error: any) {
  //     toast({
  //       title: "Error",
  //       description: error.message || "Failed to delete blog",
  //       variant: "destructive",
  //     });
  //   }
  // };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 text-center">Loading blog post...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 ">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-3 sm:gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/blog">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold">Edit Blog Post</h1>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3">
          {/* <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isSaving}
            size="sm"
          >
            <Trash className="mr-1.5 sm:mr-2 h-4 w-4" />
            Delete
          </Button> */}
          <Button variant="outline" onClick={() => router.back()} size="sm">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSaving}
            className="bg-teal-600 hover:bg-teal-700 text-white"
            size="sm"
          >
            <Save className="mr-1.5 sm:mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-10">
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="mb-5 sm:mb-6 w-full sm:w-auto flex overflow-x-auto pb-1">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="seo">SEO & Meta</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6 sm:space-y-8">
            {/* Title & Slug */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={blogData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  name="slug"
                  value={blogData.slug}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Featured Image */}
            <div className="space-y-3">
              <Label>Featured Image *</Label>
              <div className="border-2 border-dashed rounded-lg p-5 sm:p-6 bg-gray-50/70">
                {imagePreview ? (
                  <div className="relative">
                    <div className="relative aspect-video w-full max-w-3xl mx-auto rounded overflow-hidden shadow-sm">
                      <Image
                        src={imagePreview}
                        alt="Featured preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 sm:top-3 sm:right-3"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview("");
                        setBlogData((prev) => ({
                          ...prev,
                          featured_image: "",
                        }));
                      }}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="flex flex-col items-center justify-center py-10 sm:py-12 cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-9 w-9 sm:h-10 sm:w-10 text-gray-400 mb-3" />
                    <p className="text-sm sm:text-base text-gray-600 mb-1 sm:mb-2 text-center px-4">
                      Click or drag & drop to upload image
                    </p>
                    <p className="text-xs text-gray-500 text-center">
                      Recommended: 1200 × 630 pixels (16:9)
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
            </div>

            {/* Author & Excerpt */}
            <div className="space-y-2">
              <Label htmlFor="author">Author *</Label>
              <Input
                id="author"
                name="author"
                value={blogData.author}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt *</Label>
              <Textarea
                id="excerpt"
                name="excerpt"
                value={blogData.excerpt}
                onChange={handleInputChange}
                rows={4}
                required
                className="min-h-25 sm:min-h-30"
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                name="content"
                value={blogData.content}
                onChange={handleInputChange}
                rows={14}
                required
                className="min-h-75 sm:min-h-105 md:min-h-125"
              />
            </div>

            {/* Categories & Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Categories */}
              <Card>
                <CardContent className="p-4 sm:p-5 space-y-4">
                  <h3 className="font-medium text-base sm:text-lg">
                    Categories
                  </h3>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-between text-sm sm:text-base"
                      >
                        <span className="truncate">
                          {blogData.categories.length > 0
                            ? blogData.categories.join(", ")
                            : "Select or add categories"}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="start"
                      className="p-2 max-h-64 sm:max-h-72 overflow-y-auto w-full  sm:min-w-(--radix-popover-trigger-width)"
                    >
                      <div className="space-y-1">
                        {existingCategories.map((cat) => {
                          const isSelected = blogData.categories.includes(
                            cat.name,
                          );
                          return (
                            <button
                              key={cat._id}
                              type="button"
                              className={`w-full flex items-center justify-between px-3 py-2 rounded text-sm ${
                                isSelected
                                  ? "bg-teal-100 text-teal-800 font-medium"
                                  : "hover:bg-gray-100"
                              }`}
                              onClick={() => {
                                setBlogData((prev) => ({
                                  ...prev,
                                  categories: isSelected
                                    ? prev.categories.filter(
                                        (c) => c !== cat.name,
                                      )
                                    : [...prev.categories, cat.name],
                                }));
                              }}
                            >
                              <span>{cat.name}</span>
                              {isSelected && <span className="text-xs">✓</span>}
                            </button>
                          );
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>

                  {blogData.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2 sm:pt-3">
                      {blogData.categories.map((catName) => (
                        <Badge
                          key={catName}
                          variant="secondary"
                          className="flex items-center gap-1 text-xs sm:text-sm py-0.5 sm:py-1 px-2 sm:px-3"
                        >
                          {catName}
                          <X
                            className="h-3 w-3 sm:h-3.5 sm:w-3.5 cursor-pointer"
                            onClick={() => handleRemoveCategory(catName)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tags */}
              <Card>
                <CardContent className="p-4 sm:p-5 space-y-4">
                  <h3 className="font-medium text-base sm:text-lg">Tags</h3>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add new tag"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      className="text-sm sm:text-base"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleAddTag}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 min-h-10">
                    {blogData.tags.length > 0 ? (
                      blogData.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="flex items-center gap-1 text-xs sm:text-sm py-0.5 sm:py-1 px-2 sm:px-3"
                        >
                          {tag}
                          <X
                            className="h-3 w-3 sm:h-3.5 sm:w-3.5 cursor-pointer"
                            onClick={() => handleRemoveTag(tag)}
                          />
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No tags added yet</p>
                    )}
                  </div>

                  {existingTags.length > 0 && (
                    <div className="pt-2">
                      <p className="text-xs text-gray-500 mb-2">
                        Suggested tags:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {existingTags
                          .filter((t) => !blogData.tags.includes(t))
                          .slice(0, 10)
                          .map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="cursor-pointer hover:bg-gray-100 text-xs sm:text-sm px-2.5 py-0.5"
                              onClick={() =>
                                setBlogData((prev) => ({
                                  ...prev,
                                  tags: [...prev.tags, tag],
                                }))
                              }
                            >
                              {tag}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Publishing Options */}
            <Card>
              <CardContent className="p-4 sm:p-5 space-y-5 sm:space-y-6">
                <h3 className="font-medium text-base sm:text-lg">
                  Publishing Options
                </h3>
                <div className="flex items-center space-x-3">
                  <Switch
                    id="published"
                    checked={blogData.published}
                    onCheckedChange={(checked) =>
                      setBlogData((prev) => ({ ...prev, published: checked }))
                    }
                  />
                  <Label htmlFor="published" className="cursor-pointer">
                    {blogData.published ? "Published" : "Draft"}
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="publish_date">Publish Date</Label>
                  <Input
                    id="publish_date"
                    name="publish_date"
                    type="date"
                    value={blogData.publish_date}
                    onChange={handleInputChange}
                    className="w-full sm:w-64"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo" className="space-y-6 sm:space-y-8">
            <Card>
              <CardContent className="p-5 sm:p-6 space-y-5 sm:space-y-6">
                <h3 className="font-medium text-base sm:text-lg">
                  SEO Settings
                </h3>
                <div className="space-y-4 sm:space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="meta_title">Meta Title</Label>
                    <Input
                      id="meta_title"
                      name="meta_title"
                      value={blogData.meta_title}
                      onChange={handleInputChange}
                      placeholder={blogData.title || "Enter meta title"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meta_description">Meta Description</Label>
                    <Textarea
                      id="meta_description"
                      name="meta_description"
                      value={blogData.meta_description}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder={blogData.excerpt || "Brief description..."}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
}
