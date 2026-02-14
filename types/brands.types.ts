/**
 * 1. Base Brand: Sirf ye ek main source of truth hai.
 */
export interface Brand {
  _id: string; // Base interface mein ise required rakho
  name: string;
  description: string;
  icon: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 2. BrandFormData: Brand se wo fields nikal lo jo user nahi bharta.
 * Omit use karne se aapko fields repeat nahi karni padti.
 */
export type BrandFormData = Omit<Brand, "_id" | "createdAt" | "updatedAt">;

/**
 * 3. Generic API Response: Ek hi interface jo har API ke liye chale.
 */
export interface ApiResponse<Brand> {
  success: boolean;
  brands: Brand;
  message?: string;
  error?: string;
}

// Brand specific response ab aise ban jayega:
export type BrandResponse = ApiResponse<Brand>;

/**
 * 4. Paginated List: Isse bhi generic bana sakte ho.
 */
export interface PaginatedResponse<Brand> {
  brands: Brand[]; // 'brands' ki jagah 'items' likho taaki ye har resource ke liye kaam aaye
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}

export type BrandListResponse = PaginatedResponse<Brand>;

/**
 * 5. Form Props
 * Partial use kar sakte ho agar brand pura na mile.
 */
export interface BrandFormProps {
  brand?: Partial<Brand>; // Brand ke kuch ya saare fields ho sakte hain
  isEdit?: boolean;
}