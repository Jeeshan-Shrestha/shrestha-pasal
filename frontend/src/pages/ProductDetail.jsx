import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useAuth } from "../auth/AuthContext";
import { useCreateReview, useProduct, useReviews } from "../api/catalog";
import { useAddToCart } from "../api/shop";
import { ProductImage, WishlistButton } from "../components/ProductCard";
import QuantityStepper from "../components/QuantityStepper";
import {
  Badge,
  Button,
  Card,
  ErrorBox,
  Field,
  PageLoader,
  Pagination,
  Stars,
  inputClass,
} from "../components/ui";
import { dateTime, money } from "../lib/format";

function Reviews({ productId }) {
  const { isLoggedIn } = useAuth();
  const [page, setPage] = useState(0);
  const { data } = useReviews(productId, page);
  const create = useCreateReview(productId);
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { rating: 5, comment: "" },
  });

  function onSubmit(values) {
    create.mutate(
      { rating: Number(values.rating), comment: values.comment },
      {
        onSuccess: () => {
          toast.success("Thanks for your review!");
          reset();
          setPage(0);
        },
      },
    );
  }

  return (
    <section className="mt-12">
      <h2 className="mb-4 text-xl font-semibold text-gray-900">
        Customer reviews
      </h2>
      {data?.content.length === 0 && (
        <p className="mb-4 text-gray-600">No reviews yet.</p>
      )}
      <div className="space-y-3">
        {data?.content.map((review) => (
          <Card key={review.id} className="!p-4">
            <div className="mb-1 flex items-center justify-between">
              <span className="font-medium text-gray-900">
                {review.reviewer}
              </span>
              <span className="text-xs text-gray-500">
                {dateTime(review.createdAt)}
              </span>
            </div>
            <Stars value={review.rating} />
            {review.comment && (
              <p className="mt-2 text-gray-700">{review.comment}</p>
            )}
          </Card>
        ))}
      </div>
      <Pagination
        page={data?.page ?? 0}
        totalPages={data?.totalPages}
        onChange={setPage}
      />

      <Card className="mt-6">
        <h3 className="mb-3 font-semibold text-gray-900">Write a review</h3>
        {isLoggedIn ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <p className="text-sm text-gray-600">
              You can review a product after your order with it has been
              delivered.
            </p>
            <Field label="Rating">
              <select className={inputClass} {...register("rating")}>
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} star{n > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Comment (optional)">
              <textarea
                rows={3}
                maxLength={2000}
                className={inputClass}
                {...register("comment")}
              />
            </Field>
            <Button type="submit" disabled={create.isPending}>
              Submit review
            </Button>
          </form>
        ) : (
          <p className="text-gray-600">
            <Link
              to="/login"
              state={{ from: `/productDetails/${productId}` }}
              className="text-purple-600 hover:underline"
            >
              Log in
            </Link>{" "}
            to write a review.
          </p>
        )}
      </Card>
    </section>
  );
}

export default function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { data: product, isLoading, error } = useProduct(productId);
  const addToCart = useAddToCart();
  const [quantity, setQuantity] = useState(1);

  if (isLoading) return <PageLoader />;
  if (error) {
    return (
      <ErrorBox
        error={error.status === 404 ? new Error("Product not found") : error}
      />
    );
  }

  function add(goToCart) {
    if (!isLoggedIn)
      return navigate("/login", {
        state: { from: `/productDetails/${productId}` },
      });
    addToCart.mutate(
      { productId: product.id, quantity },
      {
        onSuccess: () => {
          if (goToCart) navigate("/cart");
          else toast.success("Added to cart");
        },
      },
    );
  }

  return (
    <div>
      <Link
        to="/"
        className="mb-6 inline-block text-sm text-gray-600 hover:text-gray-900"
      >
        ← Back to products
      </Link>
      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-xl border border-gray-200">
          <ProductImage product={product} className="h-80 w-full md:h-112" />
          <WishlistButton
            productId={product.id}
            className="absolute top-3 right-3"
          />
        </div>

        <div className="space-y-4">
          <Badge>{product.categoryName}</Badge>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {product.name}
          </h1>
          <Stars value={product.ratingAverage} count={product.ratingCount} />
          <p className="text-2xl font-semibold text-purple-600">
            {money(product.price)}
          </p>

          <dl className="grid grid-cols-2 gap-2 text-sm text-gray-700">
            {product.brand && (
              <>
                <dt className="text-gray-500">Brand</dt>
                <dd>{product.brand}</dd>
              </>
            )}
            {product.material && (
              <>
                <dt className="text-gray-500">Material</dt>
                <dd>{product.material}</dd>
              </>
            )}
            <dt className="text-gray-500">Availability</dt>
            <dd className={product.inStock ? "text-green-700" : "text-red-600"}>
              {product.inStock
                ? product.stockQuantity <= 5
                  ? `Only ${product.stockQuantity} left`
                  : "In stock"
                : "Out of stock"}
            </dd>
          </dl>

          {product.description && (
            <p className="whitespace-pre-line text-gray-700">
              {product.description}
            </p>
          )}

          {product.inStock && (
            <div className="space-y-4 pt-2">
              <QuantityStepper
                value={quantity}
                max={product.stockQuantity}
                onChange={setQuantity}
              />
              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  onClick={() => add(false)}
                  disabled={addToCart.isPending}
                >
                  Add to Cart
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => add(true)}
                  disabled={addToCart.isPending}
                >
                  Buy now
                </Button>
              </div>
              <p className="text-sm text-gray-600">
                Cash on delivery available.
              </p>
            </div>
          )}
        </div>
      </div>
      <Reviews productId={product.id} />
    </div>
  );
}
