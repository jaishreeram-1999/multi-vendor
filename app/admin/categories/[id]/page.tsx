"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {  CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Edit2, Trash2, Globe, Info, ImageIcon, Calendar } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ICategory } from "@/lib/schemas/category.schema";

export default function ViewCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const categoryId = params.id as string;

  const [category, setCategory] = useState<ICategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/admin/categories/${categoryId}`);

        if (data.success) {
          setCategory(data.data);
        } else {
          toast({
            title: "Error",
            description: "Category not found",
            variant: "destructive",
          });
          router.push("/admin/categories");
        }
      } catch (error) {
        console.error("Fetch error:", error);
        toast({
          title: "Error",
          description: "Failed to fetch category",
          variant: "destructive",
        });
        router.push("/admin/categories");
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) fetchCategory();
  }, [categoryId, router, toast]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      const { data } = await axios.delete(`/api/admin/categories/${categoryId}`);

      toast({
        title: "Category Deleted",
        description: data.message || "Category has been successfully deleted.",
        variant: "default",
      });
      router.push("/admin/categories");
    } catch (error) {
      console.error("Delete error:", error);
      const msg = axios.isAxiosError(error)
        ? error.response?.data?.message
        : "Failed to delete category";
      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium text-muted-foreground">Loading category details...</p>
        </div>
      </div>
    );
  }

  if (!category) return null;

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2 pl-0">
          <ArrowLeft className="h-4 w-4" />
          Back to Categories
        </Button>

        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/admin/categories/${categoryId}/edit`)}
            className="gap-2"
          >
            <Edit2 className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="">
        <div className="">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-3 flex-wrap">
                <CardTitle className="text-3xl font-bold">{category.name}</CardTitle>
                {category.isActive ? (
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1 text-sm">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="px-3 py-1 text-sm">Inactive</Badge>
                )}
              </div>
              <CardDescription className="font-mono text-base text-muted-foreground">
                /{category.slug}
              </CardDescription>
            </div>
          </div>
        </div>

        <div className="pt-8 pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left – Main Info */}
            <div className="lg:col-span-8 space-y-10">
              {/* Description */}
              <section className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Info className="h-5 w-5 text-muted-foreground" />
                  Description
                </h3>
                <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-line">
                  {category.description || "No description provided."}
                </p>
              </section>

              {/* Properties Grid */}
              <section className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-1.5 p-5 rounded-lg border bg-card/50">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Hierarchy Level
                  </p>
                  <p className="text-2xl font-bold">Level {category.level}</p>
                </div>
                <div className="space-y-1.5 p-5 rounded-lg border bg-card/50">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Sort Order
                  </p>
                  <p className="text-2xl font-bold">{category.sortOrder ?? 0}</p>
                </div>
              </section>

              {/* SEO */}
              <section className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  SEO Settings
                </h3>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5 p-5 rounded-lg border bg-card/50">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Meta Title
                    </p>
                    <p className="text-base font-medium">
                      {category.metaTitle || "—"}
                    </p>
                  </div>
                  <div className="space-y-1.5 p-5 rounded-lg border bg-card/50">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Meta Description
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {category.metaDescription || "Not set"}
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* Right – Image Sidebar */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8 h-fit">
              <section className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  Category Image
                </h3>

                <div className="rounded-xl overflow-hidden bg-muted border">
                  <AspectRatio ratio={4 / 3}>
                    {category.image ? (
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-contain  duration-500"
                        sizes="(max-width: 1024px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground/60 bg-muted/70">
                        <ImageIcon className="h-16 w-16 mb-3 opacity-40" />
                        <span className="text-sm font-medium">No image uploaded</span>
                      </div>
                    )}
                  </AspectRatio>
                </div>
              </section>
            </div>
          </div>

          <Separator className="my-10" />

          {/* Footer metadata */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-muted-foreground font-mono">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5" />
              Created: {new Date(category.createdAt || "").toLocaleString()}
            </div>
            <div className="flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5" />
              Updated: {new Date(category.updatedAt || "").toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{category.name}</strong>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="mt-4 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive flex items-center gap-3">
            <Info className="h-5 w-5 shrink-0" />
            <span>Note: Categories with subcategories cannot be deleted.</span>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90 min-w-35"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Permanently"
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}