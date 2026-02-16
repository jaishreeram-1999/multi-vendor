import { z } from "zod";
import { Types, HydratedDocument } from "mongoose";

// ==========================================
// 1. CATEGORY ZOD SCHEMA (Frontend & Backend Validation)
// ==========================================

export const categoryFormSchema = z.object({
  name: z.string()
    .min(1, "Category name is required")
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must be less than 100 characters"),
  
  slug: z.string()
    .min(1, "Slug is required")
    .max(100, "Slug must be less than 100 characters"),
  
  description: z.string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .default(""),
  
  image: z.string()
    .nullable()
    .optional()
    .default(""),
  
  parentId: z.string()
    .optional()
    .nullable()
    .transform((val) => (val === "none" || val === "" || val === "null" ? null : val)),
  
  sortOrder: z.number()
    .int()
    .min(0)
    .default(0),
  
  metaTitle: z.string()
    .max(60, "Meta title must be less than 60 characters")
    .optional()
    .default(""),
  
  metaDescription: z.string()
    .max(160, "Meta description must be less than 160 characters")
    .optional()
    .default(""),
  
  isActive: z.boolean().default(true),
});

/**
 * CategoryFormData: Isko hum Zod se hi nikal rahe hain.
 * 'z.input' use kiya hai kyunki parentId frontend par string hoti hai.
 */
export type CategoryFormData = z.input<typeof categoryFormSchema>;


// ==========================================
// 2. MONGOOSE & DB INTERFACES
// ==========================================

export interface IAncestor {
  _id: Types.ObjectId;
  name: string;
  slug: string;
}

export interface ICategory {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: Types.ObjectId | null;
  ancestors: IAncestor[];
  level: number;
  sortOrder: number;
  isActive: boolean;
  metaTitle?: string;
  metaDescription?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * CategoryDocument: Backend controllers/models mein use ke liye.
 */
export type CategoryDocument = HydratedDocument<ICategory>;


// ==========================================
// 3. API RESPONSE TYPES
// ==========================================

export interface CategoryResponse {
  success: boolean;
  data: ICategory | null;
  message?: string;
}

export interface CategoryListResponse {
  success: boolean;
  data: ICategory[];
  total: number;
}

/**
 * CategoryFormProps: Form Component ke liye props.
 */
export interface CategoryFormProps {
  initialData?: Partial<ICategory>; // DB se aane wala data
  isEdit?: boolean;
}