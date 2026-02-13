"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Save,
  Trash2,
  ArrowLeft,
  Layers,
  Image as ImageIcon,
  Search,
} from "lucide-react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import {
  categoryFormSchema,
  CategoryFormType,
} from "@/lib/schemas/category.schema";
import { ICategory } from "@/types/category.types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ImageUploader } from "./ImageUploader";
import { Separator } from "@/components/ui/separator";

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

interface CategoryFormProps {
  categoryId?: string;
  initialData?: ICategory;
}

export function CategoryForm({ categoryId, initialData }: CategoryFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [slugEditedByUser, setSlugEditedByUser] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parentCategories, setParentCategories] = useState<ICategory[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const form = useForm<CategoryFormType>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          slug: initialData.slug || "",
          description: initialData.description || "",
          image: initialData.image || "",
          parentId: initialData.parentId?.toString() || "",
          sortOrder: initialData.sortOrder || 0,
          metaTitle: initialData.metaTitle || "",
          metaDescription: initialData.metaDescription || "",
          isActive: initialData.isActive ?? true,
        }
      : {
          name: "",
          slug: "",
          description: "",
          image: "",
          parentId: "",
          sortOrder: 0,
          metaTitle: "",
          metaDescription: "",
          isActive: true,
        },
  });

  // Auto-update slug when name changes — but only if user didn't touch slug
  useEffect(() => {
    const subscription = form.watch((value, { name: changedFieldName }) => {
      // Only react when "name" field changed
      // AND user has NOT manually edited slug yet
      // AND name actually has some value
      if (
        changedFieldName === "name" &&
        !slugEditedByUser &&
        value.name?.trim()
      ) {
        form.setValue("slug", generateSlug(value.name.trim()), {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [form, slugEditedByUser]);

  // Fetch parent categories on mount
  useEffect(() => {
    const fetchParentCategories = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get("/api/admin/categories?limit=100");
        if (data.success) {
          const filtered = data.data.filter(
            (cat: ICategory) =>
              !categoryId || cat._id?.toString() !== categoryId,
          );
          setParentCategories(filtered);
        }
      } catch (error) {
        console.error("Failed to fetch parent categories:", error);
        toast({
          title: "Error",
          description: "Failed to fetch parent categories",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchParentCategories();
  }, [categoryId, toast]);

  const onSubmit = async (values: CategoryFormType) => {
    try {
      setIsSubmitting(true);

      const url = categoryId
        ? `/api/admin/categories/${categoryId}`
        : "/api/admin/categories";

      const payload = {
        ...values,
        parentId:
          values.parentId === "none" || !values.parentId
            ? null
            : values.parentId,
      };

      const result = categoryId
        ? await axios.put(url, payload)
        : await axios.post(url, payload);

      const message =
        result.data?.message ||
        (categoryId
          ? "Category updated successfully"
          : "Category created successfully");

      toast({
        title: "Success",
        description: message,
        variant: "default",
      });

      router.push("/admin/categories");
      router.refresh();
    } catch (error) {
      console.error("Submission error:", error);
      const msg = axios.isAxiosError(error)
        ? error.response?.data?.message
        : "An error occurred while saving the category";
      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsSubmitting(true);

      const { data } = await axios.delete(
        `/api/admin/categories/${categoryId}`,
      );

      toast({
        title: "Success",
        description: data.message || "Category deleted successfully",
        variant: "default",
      });

      router.push("/admin/categories");
      router.refresh();
    } catch (error) {
      console.error("Delete error:", error);
      const msg = axios.isAxiosError(error)
        ? error.response?.data?.message
        : "An error occurred while deleting the category";
      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      });
      setShowDeleteDialog(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-y-8 p-1">
      {/* Page Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            disabled={isSubmitting}
            type="button"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {categoryId ? "Edit Category" : "New Category"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {categoryId
                ? "Modify the properties of this category"
                : "Create a new classification for your products"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {categoryId && (
            <Button
              type="button"
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isSubmitting}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            onClick={form.handleSubmit(onSubmit)}
            className="min-w-[140px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {categoryId ? "Update Category" : "Save Category"}
              </>
            )}
          </Button>
        </div>
      </div>

      <Separator />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Main Content Column (2/3 width) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Enter the core details that define this category
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="font-semibold">
                        Category Name *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Mens Footwear"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="font-semibold">Slug *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. mens-footwear"
                          {...field}
                          disabled={isSubmitting}
                          onChange={(e) => {
                            field.onChange(e); // let react-hook-form handle it
                            setSlugEditedByUser(true); // ← important line
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        {slugEditedByUser
                          ? "Manually edited — will not auto-update anymore"
                          : "Auto-updates when you change the category name"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="font-semibold">
                        Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide a detailed description of what belongs in this category..."
                          {...field}
                          disabled={isSubmitting}
                          rows={6}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* SEO Metadata Card */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <Search className="h-5 w-5 text-muted-foreground" />
                <div>
                  <CardTitle>Search Engine Optimization</CardTitle>
                  <CardDescription>
                    Manage how this category appears in search results
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="metaTitle"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="font-semibold">
                        Meta Title
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter SEO title"
                          {...field}
                          disabled={isSubmitting}
                          maxLength={60}
                        />
                      </FormControl>
                      <FormDescription>
                        Recommended: 30-60 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="metaDescription"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="font-semibold">
                        Meta Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Summarize the category for search engines..."
                          {...field}
                          disabled={isSubmitting}
                          rows={3}
                          maxLength={160}
                        />
                      </FormControl>
                      <FormDescription>
                        Recommended: 120-160 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Column (1/3 width) */}
          <div className="space-y-8">
            {/* Hierarchy & Sort Card - MOVED TO TOP */}
            <Card className="border-primary/20">
              <CardHeader className="flex flex-row items-center gap-3">
                <Layers className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>Organization</CardTitle>
                  <CardDescription>Position in shop hierarchy</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="parentId"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="font-semibold">
                        Parent Category
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""} // ← use || "" instead of ?? undefined
                        disabled={isSubmitting || isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Parent" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[300px] overflow-y-auto">
                          <SelectItem value="none">
                            Top-level Category
                          </SelectItem>
                          {parentCategories.map((cat) => (
                            <SelectItem
                              key={cat._id?.toString()}
                              value={cat._id?.toString() || ""}
                            >
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sortOrder"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="font-semibold">
                        Sort Priority
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        Lower numbers appear first
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Visibility & Media Card - MOVED BELOW HIERARCHY */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <CardTitle>Visibility & Assets</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base font-semibold">
                          Status
                        </FormLabel>
                        <FormDescription>Visible in store</FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="font-semibold">
                        Display Image
                      </FormLabel>
                      <FormControl>
                        <ImageUploader
                          value={field.value || ""}
                          onValueChange={field.onChange}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        Thumbnail for category lists
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              <strong> {initialData?.name}</strong> category from the database.
              {!initialData?.ancestors || initialData.ancestors.length === 0
                ? " Please ensure there are no subcategories linked to this one."
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Yes, delete category"
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
