// models/BlogCategory.ts
import mongoose, { Schema, type Document } from "mongoose";
import slugify from "slugify";

export interface IBlogCategory extends Document {
  name: string; // "Technology", "Travel", "Food" etc.
  slug: string; // "technology", "travel-india" etc.
  description?: string; // optional description
  isActive: boolean; // show/hide category
  created_at: Date;
  updated_at: Date;
}

const BlogCategorySchema = new Schema<IBlogCategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);

// Automatic slug generation using slugify (Mongoose 9 style)
BlogCategorySchema.pre("save", function () {
  // Sirf name change hone par ya naya document hone par slug banao
  if (!this.isModified("name")) {
    return;
  }

  this.slug = slugify(this.name, {
    lower: true, // sab lowercase
    strict: true, // sirf alphanumeric aur hyphen allowed
    trim: true, // starting/ending spaces ya hyphen hatao
    remove: /[*+~.()'"!:@]/g, // extra unwanted characters remove karo
  });
});

export const BlogCategory =
  mongoose.models.BlogCategory ||
  mongoose.model<IBlogCategory>("BlogCategory", BlogCategorySchema);
