"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { ArrowLeft, Save, Upload, Plus, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  BlogApiResponse,
  blogCreateSchema,
  type BlogCreateFormData,
} from "@/lib/schemas/blog.schema";

interface Category {
  _id: string;
  name: string;
}

interface FormFieldErrorProps {
  error?: string;
}

interface BlogFormProps {
  isEdit?: boolean;
  initialSlug?: string;
}

const FormFieldError = ({ error }: FormFieldErrorProps) => {
  if (!error) return null;
  return <p className="text-sm text-red-500 mt-1">{error}</p>;
};



export default function BlogForm({
  isEdit = false,
  initialSlug,
}: BlogFormProps) {
  const router = useRouter();
  
  const {  status } = useSession();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [openCategories, setOpenCategories] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<BlogCreateFormData>({
    resolver: zodResolver(blogCreateSchema),
    mode: "onChange",
    defaultValues: {
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featured_image: "",
    author: "",
    publish_date: "",
    published: true,
    categories: [],
    tags: [],
    },
  });

  const titleValue = watch("title");



  // Fetch categories and blog data if editing
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const { data: catData } = await axios.get<{
          blogcategories: Category[];
        }>("/api//admin/blog/categories");
        setCategories(catData.blogcategories || []);

        // If editing, fetch blog data
        if (isEdit && initialSlug) {
          const { data: blogData } = await axios.get<BlogApiResponse>(
            `/api/admin/blog/${initialSlug}`,
          );

          setValue("title", blogData.title);
          setValue("slug", blogData.slug);
          setValue("excerpt", blogData.excerpt);
          setValue("content", blogData.content);
          setValue("featured_image", blogData.featured_image);
          setValue("author", blogData.author);
          setValue("published", blogData.published);
          setValue("publish_date", blogData.publish_date || "");
          setValue("meta_title", blogData.meta_title);
          setValue("meta_description", blogData.meta_description);

          setImagePreview(blogData.featured_image);
          setSelectedCategories(blogData.categories || []);
          setSelectedTags(blogData.tags || []);
        }
      } catch (error) {
        const axiosError = error as AxiosError;
        console.error("Error fetching data:", axiosError.message);
        if (isEdit && axiosError.response?.status === 404) {
          toast({
            title: "Not Found",
            description: "Blog post not found",
            variant: "destructive",
          });
          router.push("/admin/blog");
        } else if (status === "authenticated") {
          toast({
            title: "Error",
            description: "Failed to load data",
            variant: "destructive",
          });
        }
      } finally {
        setIsPageLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchData();
    }
  }, [status, isEdit, initialSlug, setValue, toast, router]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!isEdit && titleValue) {
      const generatedSlug = titleValue
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

      setValue("slug", generatedSlug);
    }
  }, [titleValue, isEdit, setValue]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setValue("featured_image", "temp-image", {
      shouldValidate: true,
    });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !selectedTags.includes(tagInput.trim())) {
      const newTags = [...selectedTags, tagInput.trim()];
      setSelectedTags(newTags);
      setValue("tags", newTags);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    const newTags = selectedTags.filter((t) => t !== tag);
    setSelectedTags(newTags);
    setValue("tags", newTags);
  };

  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((c) => c !== categoryId)
      : [...selectedCategories, categoryId];

    setSelectedCategories(newCategories);
    setValue("categories", newCategories);
  };

 const onSubmit = async (data: BlogCreateFormData) => {

    setIsSubmitting(true);
    try {
      let imageUrl = data.featured_image;

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);

        try {
          const { data: uploadResponse } = await axios.post<{ url: string }>(
            "/api/admin/upload-image",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            },
          );
          imageUrl = uploadResponse.url;
        } catch (error) {
          const axiosError = error as AxiosError<{ error?: string }>;
          throw new Error(
            axiosError.response?.data?.error || "Failed to upload image",
          );
        }
      }

      const payload = {
        ...data,
        featured_image: imageUrl,
        categories: selectedCategories,
        tags: selectedTags,
      };

      if (isEdit && initialSlug) {
        await axios.put(`/api/admin/blog/${initialSlug}`, payload);

        toast({
          title: "Success",
          description: "Blog updated successfully",
        });

        if (data.slug !== initialSlug) {
          router.push(`/admin/blog/${data.slug}`);
        } else {
          router.push("/admin/blog");
        }
      } else {
        await axios.post("/api//admin/blog", payload);

        toast({
          title: "Success",
          description: "Blog post created successfully",
        });

        router.push("/admin/blog");
      }
    } catch (error) {
      console.error("Error saving blog:", error);
      const axiosError = error as AxiosError<{ message?: string }>;
      const message =
        axiosError.response?.data?.message ||
        (error instanceof Error ? error.message : "Failed to save blog post");
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-2 py-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">
            {isEdit ? "Edit Blog Post" : "Create New Blog Post"}
          </h1>
          <Link href="/admin/blog">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="content" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="image">Image & SEO</TabsTrigger>
              <TabsTrigger value="metadata">Publishing</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="Blog title"
                      {...register("title")}
                      className="mt-1"
                    />
                    <FormFieldError error={errors.title?.message} />
                  </div>

                  <div>
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      placeholder="blog-post-slug"
                      {...register("slug")}
                      className="mt-1"
                    />
                    <FormFieldError error={errors.slug?.message} />
                  </div>

                  <div>
                    <Label htmlFor="excerpt">Excerpt *</Label>
                    <Textarea
                      id="excerpt"
                      placeholder="Brief description of the blog post"
                      rows={3}
                      {...register("excerpt")}
                      className="mt-1"
                    />
                    <FormFieldError error={errors.excerpt?.message} />
                  </div>

                  <div>
                    <Label htmlFor="content">Content *</Label>
                    <Textarea
                      id="content"
                      placeholder="Full blog content"
                      rows={10}
                      {...register("content")}
                      className="mt-1 font-mono text-sm"
                    />
                    <FormFieldError error={errors.content?.message} />
                  </div>

                  <div>
                    <Label htmlFor="author">Author *</Label>
                    <Input
                      id="author"
                      placeholder="Author name"
                      {...register("author")}
                      className="mt-1"
                    />
                    <FormFieldError error={errors.author?.message} />
                  </div>

                  <div>
                    <Label htmlFor="categories">Categories</Label>
                    <Popover
                      open={openCategories}
                      onOpenChange={setOpenCategories}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                        >
                          {selectedCategories.length > 0
                            ? `${selectedCategories.length} selected`
                            : "Select categories"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-56 p-3" align="start">
                        <div className="space-y-2">
                          {categories.map((cat) => (
                            <label
                              key={cat._id}
                              className="flex items-center gap-2 cursor-pointer hover:bg-muted p-2 rounded"
                            >
                              <input
                                type="checkbox"
                                checked={selectedCategories.includes(cat.name)}
                                onChange={() => handleCategoryToggle(cat.name)}
                                className="rounded"
                              />
                              <span className="text-sm">{cat.name}</span>
                            </label>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label htmlFor="tags">Tags</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="tags"
                        placeholder="Add a tag"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                        className="flex-1"
                      />
                      <Button type="button" onClick={handleAddTag} size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {selectedTags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {selectedTags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="image" className="space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <Label>Featured Image *</Label>
                    <div className="mt-2">
                      {imagePreview ? (
                        <div className="relative w-full h-64 bg-muted rounded-lg overflow-hidden mb-4">
                          <Image
                            src={imagePreview}
                            alt="Preview"
                            fill
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview("");
                              setImageFile(null);
                              if (fileInputRef.current)
                                fileInputRef.current.value = "";
                            }}
                            className="absolute top-2 right-2 bg-destructive text-white p-1 rounded-full hover:bg-destructive/90"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted transition-colors"
                        >
                          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Click to upload image
                          </p>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </div>
                    <FormFieldError error={errors.featured_image?.message} />
                  </div>

                  <div>
                    <Label htmlFor="meta_title">Meta Title</Label>
                    <Input
                      id="meta_title"
                      placeholder="SEO meta title"
                      {...register("meta_title")}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="meta_description">Meta Description</Label>
                    <Textarea
                      id="meta_description"
                      placeholder="SEO meta description"
                      rows={3}
                      {...register("meta_description")}
                      className="mt-1"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="metadata" className="space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <Controller
                      control={control}
                      name="published"
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                  </div>

                  <div>
                    <Label htmlFor="publish_date">Publish Date</Label>
                    <Input
                      id="publish_date"
                      type="date"
                      {...register("publish_date")}
                      className="mt-1"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              <Save className="w-4 h-4 mr-2" />
              {isEdit ? "Update Post" : "Create Post"}
            </Button>
            <Link href="/admin/blog">
              <Button variant="outline">Cancel</Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
