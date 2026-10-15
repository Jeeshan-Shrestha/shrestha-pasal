import { useSearchParams } from "react-router-dom";
import { useCategories, useProducts } from "../api/catalog";
import ProductCard from "../components/ProductCard";
import {
  Button,
  ErrorBox,
  Empty,
  PageLoader,
  Pagination,
} from "../components/ui";
import { SORT_OPTIONS, STORE_NAME } from "../lib/constants";

export default function HomePage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const categoryId = params.get("categoryId") ?? "";
  const sort = params.get("sort") ?? SORT_OPTIONS[0].value;
  const inStockOnly = params.get("inStockOnly") === "true";
  const page = Number(params.get("page") ?? 0);

  const { data: categories } = useCategories();
  const { data, isLoading, error, refetch } = useProducts({
    q,
    categoryId,
    sort,
    inStockOnly: inStockOnly || undefined,
    page,
    size: 12,
  });

  // Update one or more query params; changing any filter resets to the first page.
  function update(changes, keepPage = false) {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(changes).forEach(([key, value]) =>
        value ? next.set(key, value) : next.delete(key),
      );
      if (!keepPage) next.delete("page");
      return next;
    });
  }

  const chip = (active) =>
    active
      ? "bg-purple-600 text-white hover:bg-purple-700"
      : "border border-gray-300 text-gray-900 hover:bg-gray-100";

  return (
    <div>
      <div className="mb-10 rounded-2xl bg-linear-to-r from-violet-500 to-purple-600 p-6 text-white sm:p-10">
        <h1 className="mb-3 text-2xl font-bold sm:text-3xl">
          Welcome to {STORE_NAME}
        </h1>
        <p className="max-w-2xl text-white/90">
          Pots, pans, cutlery and traditional bhada at honest prices. Cash on
          delivery, free delivery on orders over Rs 3,000.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Button
          className={chip(!categoryId)}
          onClick={() => update({ categoryId: "" })}
        >
          All
        </Button>
        {categories?.map((category) => (
          <Button
            key={category.id}
            className={chip(String(category.id) === categoryId)}
            onClick={() => update({ categoryId: String(category.id) })}
          >
            {category.name}
          </Button>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-600">
          {q && <>Results for “{q}” · </>}
          {data ? `${data.totalElements} products` : ""}
          {q && (
            <button
              className="ml-2 cursor-pointer text-purple-600 hover:underline"
              onClick={() => update({ q: "" })}
            >
              Clear search
            </button>
          )}
        </p>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(event) =>
                update({ inStockOnly: event.target.checked ? "true" : "" })
              }
            />
            In stock only
          </label>
          <select
            value={sort}
            onChange={(event) => update({ sort: event.target.value })}
            className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-sm focus:ring-2 focus:ring-purple-400 focus:outline-none"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : error ? (
        <ErrorBox error={error} onRetry={refetch} />
      ) : data.content.length === 0 ? (
        <Empty
          title="No products found"
          text="Try a different search or category."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.content.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            onChange={(next) =>
              update({ page: next ? String(next) : "" }, true)
            }
          />
        </>
      )}
    </div>
  );
}
