import { useWishlist } from "../api/shop";
import ProductCard from "../components/ProductCard";
import {
  Button,
  Empty,
  ErrorBox,
  PageLoader,
  PageTitle,
} from "../components/ui";

export default function WishList() {
  const { data, isLoading, error, refetch } = useWishlist();

  if (isLoading) return <PageLoader />;
  if (error) return <ErrorBox error={error} onRetry={refetch} />;
  if (data.length === 0) {
    return (
      <Empty
        title="Your wishlist is empty"
        text="Tap the heart on any product to save it here."
        action={<Button to="/">Browse products</Button>}
      />
    );
  }

  return (
    <div>
      <PageTitle>My wishlist ({data.length})</PageTitle>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
