import { z } from "zod";

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

export type CategoryFormType = z.input<typeof categoryFormSchema>;
