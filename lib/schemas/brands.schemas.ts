import { z } from "zod";

/**
 * Base Brand Schema - Common fields for both Form and API
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
    .min(1, "Brand icon is required"),
  isActive: z.boolean().default(true),
});

// Types nikalne ke liye
export type BrandSchema = z.infer<typeof brandSchema>;

/**
 * Agar aapko Form ke liye 'isActive' ko optional dikhana hai 
 * taaki TypeScript error na de:
 */
export const brandFormSchema = brandSchema.extend({
  isActive: z.boolean().default(true).optional(),
});

export type BrandFormSchema = z.infer<typeof brandFormSchema>;