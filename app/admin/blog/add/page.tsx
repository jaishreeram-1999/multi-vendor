"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

interface BlogData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  author: string;
  categories: string[]; // now array of category NAMES
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

export default function CreateBlogPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [blogData, setBlogData] = useState<BlogData>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featured_image: "",
    author: "",
    categories: [],
    tags: [],
    published: true,
    publish_date: new Date().toISOString().split("T")[0],
    meta_title: "",
    meta_description: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [newTag, setNewTag] = useState("");
  const [existingCategories, setExistingCategories] = useState<Category[]>([]);
  const [isSlugEdited, setIsSlugEdited] = useState(false);
  const [existingTags] = useState<string[]>([]);

  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.name) {
        setBlogData((prev) => ({
          ...prev,
          author: session.user?.name || "",
        }));
      }
      fetchCategoriesAndTags();
    } else if (status === "unauthenticated") {
      router.push("/login?redirect=/dashboard/blogs/new");
    }
  }, [status, session?.user?.name, router]);

  const fetchCategoriesAndTags = async () => {
    try {
      const response = await fetch("/api/admin/blog/categories");
      if (response.ok) {
        const { blogcategories } = await response.json();
        console.log("Fetched categories:", blogcategories);
        setExistingCategories(blogcategories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setBlogData((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === "title" && !isSlugEdited) {
        const slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
        updated.slug = slug;
      }

      return updated;
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
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
      if (
        !blogData.title.trim() ||
        !blogData.slug.trim() ||
        !blogData.excerpt.trim() ||
        !blogData.content.trim() ||
        !blogData.author.trim()
      ) {
        toast({
          title: "Validation Error",
          description: "Title, slug, excerpt, content, and author are required",
          variant: "destructive",
        });
        return;
      }

      if (!blogData.featured_image && !imageFile) {
        toast({
          title: "Validation Error",
          description: "Please upload a featured image",
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
          const errorData = await uploadResponse.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to upload image");
        }

        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.url;
      }

      const dataToSend = {
        ...blogData,
        featured_image: imageUrl,
      };

      const response = await fetch("/api/admin/blog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create blog post");
      }

      toast({
        title: "Success",
        description: "Blog post created successfully",
        variant: "success",
      });

      router.push("/admin/blog");
    } catch (error: unknown) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create blog post",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3 sm:gap-4">
          <Button variant="outline" size="icon" asChild className="shrink-0">
            <Link href="/admin/blog">
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold truncate">
            Create New Blog Post
          </h1>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSaving}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Post"}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <Tabs defaultValue="content" className="w-full ">
          <TabsList className="mb-6">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="seo">SEO & Metadata</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-8 ">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={blogData.title}
                  onChange={handleInputChange}
                  placeholder="Enter an engaging title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  name="slug"
                  value={blogData.slug}
                  onChange={(e) => {
                    setIsSlugEdited(true);
                    handleInputChange(e);
                  }}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Featured Image *</Label>
              <div className="border-2 border-dashed rounded-lg p-6 bg-gray-50">
                {imagePreview ? (
                  <div className="relative">
                    <div className="relative aspect-video w-full max-h-105 rounded overflow-hidden shadow-sm">
                      <Image
                        src={imagePreview || "/placeholder.svg"}
                        alt="Featured preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-3 right-3"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview("");
                      }}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="flex flex-col items-center justify-center py-12 cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-10 w-10 text-gray-400 mb-3" />
                    <p className="text-sm text-gray-600 mb-2">
                      Click or drag & drop to upload image
                    </p>
                    <p className="text-xs text-gray-500">
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

            <div className="space-y-2">
              <Label htmlFor="author">Author *</Label>
              <Input
                id="author"
                name="author"
                value={blogData.author}
                onChange={handleInputChange}
                placeholder="Author name"
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
                placeholder="A short summary (displayed in listings and search results)"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                name="content"
                value={blogData.content}
                onChange={handleInputChange}
                rows={18}
                placeholder="Write your blog post here... "
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Categories */}
              <Card>
                <CardContent className="p-5 space-y-4">
                  <h3 className="font-medium text-lg">Categories</h3>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-between truncate"
                      >
                        <span className="truncate">
                          {blogData.categories.length > 0
                            ? blogData.categories.join(", ")
                            : "Select Categories"}
                        </span>
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent
                      align="start"
                      className="p-2 max-h-64"
                      style={{ width: "var(--radix-popover-trigger-width)" }}
                    >
                      <div className="max-h-60 overflow-y-auto space-y-1">
                        {existingCategories.map((cat) => {
                          const selected = blogData.categories.includes(
                            cat.name,
                          );

                          return (
                            <button
                              type="button"
                              key={cat._id}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition ${
                                selected
                                  ? "bg-teal-100 text-teal-700"
                                  : "hover:bg-gray-100"
                              }`}
                              onClick={() => {
                                setBlogData((prev) => ({
                                  ...prev,
                                  categories: selected
                                    ? prev.categories.filter(
                                        (c) => c !== cat.name,
                                      )
                                    : [...prev.categories, cat.name],
                                }));
                              }}
                            >
                              <span className="truncate">{cat.name}</span>
                              {selected && <span className="text-xs">✓</span>}
                            </button>
                          );
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>

                  {blogData.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {blogData.categories.map((catName) => (
                        <Badge
                          key={catName}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {catName}
                          <X
                            className="h-3 w-3 cursor-pointer"
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
                <CardContent className="p-5 space-y-4">
                  <h3 className="font-medium text-lg">Tags</h3>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="New tag"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
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

                  <div className="flex flex-wrap gap-2 min-h-15">
                    {blogData.tags.length > 0 ? (
                      blogData.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="flex items-center gap-1 pl-3 pr-2 py-1"
                        >
                          {tag}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 rounded-full"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
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
                          .slice(0, 8)
                          .map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="cursor-pointer hover:bg-gray-100"
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

            <Card>
              <CardContent className="p-6 space-y-6">
                <h3 className="font-medium text-lg">Publishing Options</h3>

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
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-6">
                <h3 className="font-medium text-lg">SEO Settings</h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="meta_title">Meta Title</Label>
                    <Input
                      id="meta_title"
                      name="meta_title"
                      value={blogData.meta_title}
                      onChange={handleInputChange}
                      placeholder={blogData.title || "Enter meta title"}
                    />
                    <p className="text-xs text-gray-500">
                      Recommended: 50–60 characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meta_description">Meta Description</Label>
                    <Textarea
                      id="meta_description"
                      name="meta_description"
                      value={blogData.meta_description}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder={
                        blogData.excerpt ||
                        "Brief description for search engines and social sharing"
                      }
                    />
                    <p className="text-xs text-gray-500">
                      Recommended: 120–160 characters
                    </p>
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
