import { Types, HydratedDocument } from "mongoose";

// Ancestor interface (same rakh sakte ho)
export interface IAncestor {
  _id: Types.ObjectId;
  name: string;
  slug: string;
}

// Main category shape jo MongoDB se aata hai (lean ya populated)
// _id ko optional mat rakho – MongoDB mein hamesha hota hai
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

// Agar tumhe hydrated document (methods, virtuals wala) type chahiye
// to yeh use karo – yeh sabse recommended hai ab
export type CategoryDocument = HydratedDocument<ICategory>;

// Response types (same rakh sakte ho, bas ICategory use kar rahe hain)
export interface CategoryListResponse {
  success: boolean;
  data: ICategory[];
  total: number;
}

export interface CategoryResponse {
  success: boolean;
  data: ICategory | null;
  message?: string;
}

// Form data (frontend se aane wala – parentId string hota hai)
export interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  image: string;
  parentId: string;           // string kyunki select se aata hai
  metaTitle: string;
  metaDescription: string;
  sortOrder: number;
  isActive: boolean;
}