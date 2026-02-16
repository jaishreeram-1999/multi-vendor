import { z } from "zod";

const slug_regex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const blogCreateSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be less than 200 characters"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(100, "Slug must be less than 100 characters")
    .regex(
      slug_regex,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    ),
  excerpt: z
    .string()
    .min(10, "Excerpt must be at least 10 characters")
    .max(500, "Excerpt must be less than 500 characters"),
  content: z
    .string()
    .min(50, "Content must be at least 50 characters")
    .max(50000, "Content must be less than 50000 characters"),
  featured_image: z.string().min(1, "Featured image is required"),
  author: z
    .string()
    .min(2, "Author must be at least 2 characters")
    .max(100, "Author must be less than 100 characters"),
  categories: z.array(z.string()),
  tags: z.array(z.string()),
  published: z.boolean(),
  publish_date: z.string().optional().or(z.literal("")),
  meta_title: z
    .string()
    .optional(),
   
  meta_description: z
    .string()
    .optional()
});

export const blogUpdateSchema = blogCreateSchema.extend({
  _id: z.string().optional(),
});

export type BlogCreateFormData = z.infer<typeof blogCreateSchema>;
export type BlogUpdateFormData = z.infer<typeof blogUpdateSchema>;

export const blogApiResponseSchema = z.object({
  _id: z.string(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string(),
  content: z.string(),
  featured_image: z.string(),
  author: z.string(),
  categories: z.array(z.string()),
  tags: z.array(z.string()),
  published: z.boolean(),
  publish_date: z.string().nullable(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const blogsListResponseSchema = z.object({
  blogs: z.array(blogApiResponseSchema),
  pagination: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
});

export const blogCreateResponseSchema = z.object({
  message: z.string(),
  blog: blogApiResponseSchema,
});

export type BlogApiResponse = z.infer<typeof blogApiResponseSchema>;
export type BlogsListResponse = z.infer<typeof blogsListResponseSchema>;
export type BlogCreateResponse = z.infer<typeof blogCreateResponseSchema>;
