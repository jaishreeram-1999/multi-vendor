"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { BrandForm } from "../../_components/brand-form";
import { useToast } from "@/hooks/use-toast";
import type { Brand } from "@/types/brands.types";
import { Loader2Icon } from "lucide-react";

export default function EditBrandPage(): React.JSX.Element {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrand = async (): Promise<void> => {
      try {
        if (!params.id) {
          throw new Error("Brand ID not found");
        }

        const response = await axios.get<Brand>(
          `/api/admin/brands/${params.id}`
        );
        setBrand(response.data);
      } catch (error) {
        const errorMessage =
          axios.isAxiosError(error) && error.response?.data?.message
            ? String(error.response.data.message)
            : "Failed to fetch brand";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        router.push("/admin/brands");
      } finally {
        setLoading(false);
      }
    };

    fetchBrand();
  }, [params.id, router, toast]);

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-2">
        <Loader2Icon className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">
          Loading brand...
        </p>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="space-y-6 px-2 py-4">
        <div>
          <h1 className="text-4xl font-bold">Brand Not Found</h1>
          <p className="text-muted-foreground">The brand you are looking for does not exist</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-2 py-4">
      <div>
        <h1 className="text-4xl font-bold">Edit Brand</h1>
        <p className="text-muted-foreground">Update brand information</p>
      </div>
      <BrandForm brand={brand} isEdit={true} />
    </div>
  );
}
