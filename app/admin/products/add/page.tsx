import { ProductForm } from "../_components/product-form"

export default function NewProductPage() {
  return (
    <div className="space-y-6 px-2 py-4">
      <div>
        <h1 className="text-3xl font-bold">Add Product</h1>
        <p className="text-muted-foreground">Create a new product for your store</p>
      </div>
      <ProductForm />
    </div>
  )
}
