// import { CategoriesContainer } from "@/app/admin/categories/_components/CategoriesContainer";

// export default function CategoriesPage() {
//   return (
//     <div className="p-2">
//
//       <CategoriesContainer />
//     </div>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { CategoriesTable } from "@/app/admin/categories/_components/CategoriesTable";
import { ICategory } from "@/types/category.types";

interface FilterState {
  search: string;
  level: string;
  isActive: string;
}

interface PaginationState {
  currentPage: number;
  totalPages: number;
  total: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    level: "",
    isActive: "",
  });
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });

  const fetchCategories = async (page = 1) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "10");

      // Add filters to request
      if (filters.search) params.append("search", filters.search);
      if (filters.level) params.append("level", filters.level);
      if (filters.isActive) params.append("isActive", filters.isActive);

      const { data } = await axios.get(
        `/api/admin/categories?${params.toString()}`,
      );

      if (data.success) {
        setCategories(data.data);
        setPagination({
          currentPage: data.page,
          totalPages: data.pages,
          total: data.total,
        });
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchCategories(1);
  }, []);

  // Fetch when filters change
  useEffect(() => {
    fetchCategories(1);
  }, [filters]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    fetchCategories(page);
  };

  const handleDelete = (id: string) => {
    setCategories(categories.filter((cat) => cat._id?.toString() !== id));
    setPagination((prev) => ({
      ...prev,
      total: prev.total - 1,
      totalPages: Math.ceil((prev.total - 1) / 10),
    }));
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Categories</h1>
        <p className="text-muted-foreground">Manage your product categories</p>
      </div>

      <CategoriesTable
        categories={categories}
        onDelete={handleDelete}
        isLoading={isLoading}
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
        onFilterChange={handleFilterChange}
      />
      
    </div>
  );
}
