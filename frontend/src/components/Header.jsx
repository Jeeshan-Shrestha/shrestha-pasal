import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FaRegHeart, FaSearch } from "react-icons/fa";
import { LuShoppingCart } from "react-icons/lu";
import { useAuth } from "../auth/AuthContext";
import { useCart, useWishlist } from "../api/shop";
import { STORE_NAME } from "../lib/constants";
import { Button } from "./ui";

function CountBadge({ count }) {
  if (!count) return null;
  return (
    <span className="absolute -top-1 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-purple-600 px-1 text-xs text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

function SearchBar({ className = "" }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [text, setText] = useState(params.get("q") ?? "");

  function submit(event) {
    event.preventDefault();
    const query = text.trim();
    navigate(query ? `/?q=${encodeURIComponent(query)}` : "/");
  }

  return (
    <form onSubmit={submit} className={`relative ${className}`}>
      <FaSearch className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Search utensils..."
        className="w-full rounded-full border border-gray-200 bg-white py-2 pr-4 pl-9 text-sm focus:ring-2 focus:ring-purple-400 focus:outline-none"
      />
    </form>
  );
}

export default function Header() {
  const { user, isLoggedIn } = useAuth();
  const { data: cart } = useCart();
  const { data: wishlist } = useWishlist();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600">
              <LuShoppingCart className="h-5 w-5 text-white" />
            </span>
            <span className="text-lg font-bold text-gray-900 sm:text-xl">
              {STORE_NAME}
            </span>
          </Link>

          <SearchBar className="mx-4 hidden max-w-md flex-1 md:block" />

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              to="/wishlist"
              className="relative"
              aria-label="Wishlist"
            >
              <FaRegHeart className="h-4 w-4" />
              <CountBadge count={wishlist?.length} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              to="/cart"
              className="relative"
              aria-label="Cart"
            >
              <LuShoppingCart className="h-5 w-5" />
              <CountBadge count={cart?.itemCount} />
            </Button>
            {isLoggedIn ? (
              <Button variant="ghost" to="/userProfile" className="max-w-32">
                <span className="truncate font-bold">
                  {user?.fullName?.split(" ")[0] ?? "Account"}
                </span>
              </Button>
            ) : (
              <Button to="/login" className="ml-2">
                Login
              </Button>
            )}
          </div>
        </div>
        <SearchBar className="mt-3 md:hidden" />
      </div>
    </header>
  );
}
