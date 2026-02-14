import mongoose, { Schema, Model, models } from "mongoose";
import { ICategory, CategoryDocument } from "@/types/category.types";

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    image: {
      type: String,
      default: "",
    },

    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
      index: true,
    },

    ancestors: [
      {
        _id: {
          type: Schema.Types.ObjectId,
          ref: "Category",
          required: true,
        },
        name: { type: String, required: false },
        slug: { type: String, required: false },
      },
    ],

    level: {
      type: Number,
      default: 0,
      index: true,
      min: 0,
    },

    sortOrder: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    metaTitle: {
      type: String,
      default: "",
      trim: true,
    },

    metaDescription: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* ============================= */
/* Indexes */
/* ============================= */

CategorySchema.index({ parentId: 1, sortOrder: 1 });
CategorySchema.index({ "ancestors._id": 1 });

/* ============================= */
/* Pre-save Hook (Modern Style) */
/* ============================= */

CategorySchema.pre("save", async function () {
  const category = this as CategoryDocument;

  /* ---------- Slug Generation ---------- */

  if (category.isModified("name") || !category.slug) {
    const baseSlug = category.slug || category.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    let slug = baseSlug;
    let counter = 1;

    while (
      await Category.exists({
        slug,
        _id: { $ne: category._id },
      })
    ) {
      slug = `${baseSlug}-${counter++}`;
    }

    category.slug = slug;

    if (!category.metaTitle) {
      category.metaTitle = category.name;
    }

    if (!category.metaDescription && category.description) {
      category.metaDescription =
        category.description.replace(/<[^>]*>/g, "").slice(0, 157) + "...";
    }
  }

  /* ---------- Tree Logic For Ancesters ---------- */

  if (category.isModified("parentId")) {
    if (!category.parentId) {
      category.ancestors = [];
      category.level = 0;
    } else {
      const parent = await Category.findById(category.parentId)
        .select("_id name slug ancestors level")
        .lean();

      if (parent) {
        category.ancestors = [
          ...parent.ancestors,
          {
            _id: parent._id,
            name: parent.name,
            slug: parent.slug,
          },
        ];

        category.level = parent.level + 1;
      }
    }
  }
});

export const Category: Model<ICategory> =
  models.Category || mongoose.model<ICategory>("Category", CategorySchema);
