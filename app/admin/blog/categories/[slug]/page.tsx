"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Category {
  name: string;
  description?: string;
  isActive: boolean;
}

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams(); // ✅ get slug from URL
  const slug = params?.slug;  // slug is now safe
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    if (!slug) return; // wait for slug
    async function fetchCategory() {
      try {
        const res = await fetch(`/api/admin/blog/categories/${slug}`);
        if (!res.ok) throw new Error("Category not found");
        const data = await res.json();
        setCategory(data.category); // ✅ use data.category
      } catch (err: unknown) {
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to load category",
          variant: "destructive",
        })
      } finally {
        setLoading(false);
      }
    }
    fetchCategory();
  }, [slug, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !slug) return;

    setError("");
    setFormLoading(true);

    try {
      const res = await fetch(`/api/admin/blog/categories/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: category.name,
          description: category.description,
          isActive: category.isActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast({
          title: "Error",
          description: data.error || "Failed to save changes",
          variant: "destructive",
        })
      }

      toast({
        title: "Success",
        description: "Blog Category updated successfully",
        variant: "success",
      })

      router.push("/admin/blog/categories");
      router.refresh();
    } catch (err: unknown) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save changes",
        variant: "destructive",
      })
      console.log(err);
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) return <div className="py-10 text-center">Loading...</div>;
  if (error) return <div className="py-10 text-red-600 text-center">{error}</div>;
  if (!category) return <div className="py-10 text-center">Category not found</div>;

  return (
    <div className="container mx-auto p-4 ">
      <h1 className="text-3xl font-bold mb-2">Edit Blog Category</h1>
      <p className="text-gray-600 mb-8">Slug: <code>{slug}</code></p>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-6">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2 font-medium">Category Name *</label>
          <input
            type="text"
            value={category.name}
            onChange={(e) => setCategory({ ...category, name: e.target.value })}
            className="w-full border rounded px-4 py-2"
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Description</label>
          <textarea
            value={category.description || ""}
            onChange={(e) => setCategory({ ...category, description: e.target.value })}
            className="w-full border rounded px-4 py-2 min-h-25"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={category.isActive}
            onChange={(e) => setCategory({ ...category, isActive: e.target.checked })}
            className="mr-2"
          />
          <label htmlFor="isActive">Active (visible on website)</label>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={formLoading}
            className="bg-teal-600 text-white px-6 py-2 rounded hover:bg-teal-700 disabled:opacity-50"
          >
            {formLoading ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-200 px-6 py-2 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
