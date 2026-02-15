import { z } from "zod";

/**
 * 1. ZOD SCHEMAS (Validation Logic)
 * Aapne jo schemas diye the, wahi same yahan hain.
 */

export const brandSchema = z.object({
  name: z
    .string()
    .min(1, "Brand name is required")
    .min(2, "Brand name must be at least 2 characters")
    .max(100, "Brand name must not exceed 100 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must not exceed 500 characters"),
  icon: z
    .string()
    .min(1, "Icon is required"),
  isActive: z.boolean().default(true),
});

// Zod se direct type nikalne ke liye
export type BrandSchema = z.infer<typeof brandSchema>;

/**
 * Form ke liye Extended Schema
 */
export const brandFormSchema = brandSchema.extend({
  isActive: z.boolean().default(true).optional(),
});

// Form ke liye Inferred Type
export type BrandFormSchema = z.infer<typeof brandFormSchema>;


/**
 * 2. TYPES & INTERFACES (Data Structures)
 * Ye API aur Components mein kaam aayenge.
 */

export interface Brand {
  _id: string; // Base interface mein required
  name: string;
  description: string;
  icon: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * BrandFormData: Form ke liye Brand se DB fields hata di hain.
 */
export type BrandFormData = Omit<Brand, "_id" | "createdAt" | "updatedAt">;

/**
 * Generic API Response Interface
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T; // 'brands' ki jagah 'data' zyada generic aur error-free rehta hai
  message?: string;
  error?: string;
}

// Brand specific response
export type BrandResponse = ApiResponse<Brand>;

/**
 * Generic Paginated Response
 */
export interface PaginatedResponse<T> {
  brands: T[]; // 'brands' ki jagah 'items' taaki ye reusable ho
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}

// Brand List response
export type BrandListResponse = PaginatedResponse<Brand>;

/**
 * BrandFormProps for Components
 */
export interface BrandFormProps {
  brand?: Partial<Brand>; // Brand ke saare ya kuch fields
  isEdit?: boolean;
}