"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { CategoryForm } from "@/app/admin/categories/_components/CategoryForm";
import { ICategory } from "@/types/category.types";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";


interface CategoryFormProps {
  categoryId?: string;
  initialData?: ICategory | null;
}
export default function EditCategoryPage() {
  const params = useParams();
  const { toast } = useToast();
  const categoryId = params.id as string;
  const [category, setCategory] = useState<ICategory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          `/api/admin/categories/${categoryId}`
        );

        if (data.success) {
          setCategory(data.data);
        } else {
          toast({
            title: "Error",
            description: "Category not found",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Failed to fetch category:", error);
        toast({
          title: "Error",
          description: "Failed to fetch category",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId, toast]);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-12 w-64 bg-muted rounded-lg animate-pulse" />
        <Card>
          <CardContent className="pt-6 space-y-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return <CategoryForm categoryId={categoryId} initialData={category ?? undefined} />;
}
