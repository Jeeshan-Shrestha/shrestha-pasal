import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  useAdminProducts,
  useDeactivateProduct,
  useSaveProduct,
} from "../../api/admin";
import { useCategories } from "../../api/catalog";
import {
  Badge,
  Button,
  ErrorBox,
  Field,
  Modal,
  PageLoader,
  Pagination,
  inputClass,
} from "../../components/ui";
import { money } from "../../lib/format";

function ProductForm({ product, onClose }) {
  const { data: categories } = useCategories();
  const save = useSaveProduct();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      price: product?.price ?? "",
      stockQuantity: product?.stockQuantity ?? 0,
      categoryId: product?.categoryId ?? "",
      material: product?.material ?? "",
      brand: product?.brand ?? "",
      imageUrl: product?.imageUrl ?? "",
      active: product?.active ?? true,
    },
  });

  function onSubmit(values) {
    save.mutate(
      {
        id: product?.id,
        ...values,
        price: Number(values.price),
        stockQuantity: Number(values.stockQuantity),
        categoryId: Number(values.categoryId),
      },
      {
        onSuccess: () => {
          toast.success(product ? "Product updated" : "Product created");
          onClose();
        },
      },
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <Field label="Name" error={errors.name?.message}>
        <input
          className={inputClass}
          {...register("name", { required: "Required" })}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Price (Rs)" error={errors.price?.message}>
          <input
            type="number"
            step="0.01"
            min="0.01"
            className={inputClass}
            {...register("price", {
              required: "Required",
              min: { value: 0.01, message: "Must be above 0" },
            })}
          />
        </Field>
        <Field label="Stock" error={errors.stockQuantity?.message}>
          <input
            type="number"
            min="0"
            step="1"
            className={inputClass}
            {...register("stockQuantity", {
              required: "Required",
              min: { value: 0, message: "Cannot be negative" },
            })}
          />
        </Field>
      </div>
      <Field label="Category" error={errors.categoryId?.message}>
        <select
          className={inputClass}
          {...register("categoryId", { required: "Choose a category" })}
        >
          <option value="">Select...</option>
          {categories?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Material">
          <input
            className={inputClass}
            placeholder="Stainless Steel"
            {...register("material")}
          />
        </Field>
        <Field label="Brand">
          <input className={inputClass} {...register("brand")} />
        </Field>
      </div>
      <Field label="Image URL">
        <input
          className={inputClass}
          placeholder="https://..."
          {...register("imageUrl")}
        />
      </Field>
      <Field label="Description">
        <textarea
          rows={3}
          className={inputClass}
          {...register("description")}
        />
      </Field>
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" {...register("active")} /> Visible in the shop
      </label>
      <div className="flex gap-2 pt-1">
        <Button type="submit" disabled={save.isPending}>
          {product ? "Save changes" : "Create product"}
        </Button>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default function AdminProducts() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState(null); // product | "new" | null
  const { data, isLoading, error } = useAdminProducts({ q, page, size: 10 });
  const deactivate = useDeactivateProduct();

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <input
          value={q}
          onChange={(event) => {
            setQ(event.target.value);
            setPage(0);
          }}
          placeholder="Search products..."
          className="w-full max-w-xs rounded-full border border-gray-200 px-4 py-2 text-sm focus:ring-2 focus:ring-purple-400 focus:outline-none"
        />
        <Button onClick={() => setEditing("new")}>+ New product</Button>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : error ? (
        <ErrorBox error={error} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-2">Product</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Price</th>
                <th className="px-4 py-2">Stock</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {data.content.map((product) => (
                <tr key={product.id} className="border-t border-gray-100">
                  <td className="px-4 py-2 font-medium text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-4 py-2">{product.categoryName}</td>
                  <td className="px-4 py-2">{money(product.price)}</td>
                  <td
                    className={`px-4 py-2 ${product.stockQuantity <= 5 ? "font-semibold text-red-600" : ""}`}
                  >
                    {product.stockQuantity}
                  </td>
                  <td className="px-4 py-2">
                    {product.active ? (
                      <Badge>Active</Badge>
                    ) : (
                      <Badge className="bg-gray-200 text-gray-700">
                        Hidden
                      </Badge>
                    )}
                  </td>
                  <td className="space-x-2 px-4 py-2 text-right whitespace-nowrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditing(product)}
                    >
                      Edit
                    </Button>
                    {product.active && (
                      <Button
                        size="sm"
                        variant="danger"
                        disabled={deactivate.isPending}
                        onClick={() => {
                          if (
                            window.confirm(
                              `Hide "${product.name}" from the shop?`,
                            )
                          ) {
                            deactivate.mutate(product.id, {
                              onSuccess: () => toast.success("Product hidden"),
                            });
                          }
                        }}
                      >
                        Hide
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {data.content.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No products.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <Pagination
        page={data?.page ?? 0}
        totalPages={data?.totalPages}
        onChange={setPage}
      />

      {editing && (
        <Modal
          title={editing === "new" ? "New product" : "Edit product"}
          onClose={() => setEditing(null)}
        >
          <ProductForm
            product={editing === "new" ? null : editing}
            onClose={() => setEditing(null)}
          />
        </Modal>
      )}
    </div>
  );
}
