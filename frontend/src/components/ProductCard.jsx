import { Link, useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import toast from "react-hot-toast";
import { useAuth } from "../auth/AuthContext";
import { useAddToCart, useToggleWishlist, useWishlist } from "../api/shop";
import { money } from "../lib/format";
import { Badge, Button, Stars } from "./ui";

export function ProductImage({ product, className = "" }) {
  return product.imageUrl ? (
    <img
      src={product.imageUrl}
      alt={product.name}
      className={`bg-white object-contain ${className}`}
    />
  ) : (
    <div
      className={`flex items-center justify-center bg-purple-50 text-5xl ${className}`}
    >
      🍳
    </div>
  );
}

/** Heart button shared by the card and the detail page. */
export function WishlistButton({ productId, className = "" }) {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const { data: wishlist } = useWishlist();
  const toggle = useToggleWishlist();
  const saved = !!wishlist?.some((item) => item.id === productId);

  function onClick(event) {
    event.preventDefault();
    event.stopPropagation();
    if (!isLoggedIn)
      return navigate("/login", { state: { from: "/wishlist" } });
    toggle.mutate({ productId, saved });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
      className={`flex size-9 cursor-pointer items-center justify-center rounded-full bg-white/80 backdrop-blur hover:bg-white ${saved ? "text-red-500" : "text-gray-900"} ${className}`}
    >
      {saved ? (
        <FaHeart className="h-4 w-4" />
      ) : (
        <FaRegHeart className="h-4 w-4" />
      )}
    </button>
  );
}

export default function ProductCard({ product }) {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const addToCart = useAddToCart();

  function handleAdd(event) {
    event.preventDefault();
    event.stopPropagation();
    if (!isLoggedIn) return navigate("/login", { state: { from: "/" } });
    addToCart.mutate(
      { productId: product.id, quantity: 1 },
      { onSuccess: () => toast.success("Added to cart") },
    );
  }

  return (
    <Link
      to={`/productDetails/${product.id}`}
      className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-400/10"
    >
      <div className="relative h-48 overflow-hidden sm:h-56">
        <ProductImage
          product={product}
          className="h-full w-full transition-transform duration-300 group-hover:scale-105"
        />
        <WishlistButton
          productId={product.id}
          className="absolute top-2 right-2"
        />
      </div>
      <div className="space-y-2 p-4">
        <Badge>{product.categoryName}</Badge>
        <h3 className="line-clamp-1 text-lg font-semibold text-gray-900">
          {product.name}
        </h3>
        <Stars value={product.ratingAverage} count={product.ratingCount} />
        <div className="flex flex-col gap-2 pt-1">
          <span className="text-lg font-semibold text-purple-600">
            {money(product.price)}
          </span>
          <Button
            onClick={handleAdd}
            disabled={!product.inStock || addToCart.isPending}
          >
            {product.inStock ? "Add to Cart" : "Out of stock"}
          </Button>
        </div>
      </div>
    </Link>
  );
}
