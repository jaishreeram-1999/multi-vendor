import { CategoryForm } from "@/app/admin/categories/_components/CategoryForm";

export const metadata = {
  title: "Add Category | Admin Panel",
  description: "Create a new product category",
};

export default function AddCategoryPage() {
  return (
    <div className="space-y-6">
      <CategoryForm />
    </div>
  );
}
