"use client";

import { useEffect, useState, useCallback } from "react"; // 1. useCallback add kiya
import axios from "axios";
import { CategoriesTable } from "@/app/admin/categories/_components/CategoriesTable";
import { ICategory } from "@/lib/schemas/category.schema";

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

  // 2. fetchCategories ko useCallback mein wrap kiya
  // Isse ye function tabhi recreate hoga jab 'filters' badlenge
  const fetchCategories = useCallback(async (page = 1) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "10");

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
  }, [filters]); // Dependency array mein 'filters' zaroori hai

  // 3. Mount aur Filter change dono ko ek hi useEffect handle kar lega
  useEffect(() => {
    fetchCategories(1);
  }, [filters,fetchCategories]); 

 // handleFilterChange ko simple rakhein
const handleFilterChange = useCallback((newFilters: FilterState) => {
  setFilters(newFilters);
  // Hum page 1 par reset kar rahe hain kyunki search badalne par 
  // purana pagination invalid ho jata hai
}, []);

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