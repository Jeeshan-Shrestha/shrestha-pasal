import { Link } from "react-router-dom";
import { FiTrash } from "react-icons/fi";
import { useCart, useRemoveFromCart, useSetCartQuantity } from "../api/shop";
import { ProductImage } from "../components/ProductCard";
import QuantityStepper from "../components/QuantityStepper";
import OrderSummary from "../components/OrderSummary";
import {
  Button,
  Card,
  Empty,
  ErrorBox,
  PageLoader,
  PageTitle,
} from "../components/ui";
import { money } from "../lib/format";

export default function Cart() {
  const { data: cart, isLoading, error, refetch } = useCart();
  const setQuantity = useSetCartQuantity();
  const remove = useRemoveFromCart();

  if (isLoading) return <PageLoader />;
  if (error) return <ErrorBox error={error} onRetry={refetch} />;

  if (cart.items.length === 0) {
    return (
      <Empty
        title="Your cart is empty"
        text="Add some utensils to get started."
        action={
          <Button size="lg" to="/">
            Continue shopping
          </Button>
        }
      />
    );
  }

  const blocked = cart.items.some((item) => !item.available);

  return (
    <div>
      <PageTitle>Shopping cart ({cart.itemCount} items)</PageTitle>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-4 md:col-span-2">
          {cart.items.map((item) => (
            <Card key={item.productId} className="flex gap-4 !p-4">
              <Link
                to={`/productDetails/${item.productId}`}
                className="shrink-0"
              >
                <ProductImage
                  product={{ imageUrl: item.imageUrl, name: item.name }}
                  className="size-24 rounded-lg"
                />
              </Link>
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    to={`/productDetails/${item.productId}`}
                    className="font-semibold text-gray-900 hover:underline"
                  >
                    {item.name}
                  </Link>
                  <Button
                    variant="danger"
                    size="icon"
                    aria-label="Remove"
                    disabled={remove.isPending}
                    onClick={() => remove.mutate(item.productId)}
                  >
                    <FiTrash className="h-4 w-4" />
                  </Button>
                </div>
                {!item.available && (
                  <p className="text-sm text-red-600">
                    {item.availableStock === 0
                      ? "No longer available. Remove it to continue."
                      : `Only ${item.availableStock} left. Lower the quantity.`}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <QuantityStepper
                    value={item.quantity}
                    max={item.availableStock}
                    disabled={setQuantity.isPending}
                    onChange={(quantity) =>
                      setQuantity.mutate({
                        productId: item.productId,
                        quantity,
                      })
                    }
                  />
                  <div className="text-right">
                    <p className="font-semibold text-purple-600">
                      {money(item.lineTotal)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {money(item.unitPrice)} each
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <OrderSummary cart={cart}>
          <Button
            size="lg"
            to="/order/checkout"
            className="w-full"
            disabled={blocked}
          >
            Proceed to checkout
          </Button>
        </OrderSummary>
      </div>
    </div>
  );
}
