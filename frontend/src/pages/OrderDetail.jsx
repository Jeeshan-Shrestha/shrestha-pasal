import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useCancelOrder, useOrder } from "../api/shop";
import { ProductImage } from "../components/ProductCard";
import {
  Button,
  Card,
  ErrorBox,
  PageLoader,
  StatusBadge,
} from "../components/ui";
import { dateTime, money, titleCase } from "../lib/format";

export default function OrderDetail() {
  const { orderId } = useParams();
  const { data: order, isLoading, error } = useOrder(orderId);
  const cancel = useCancelOrder();

  if (isLoading) return <PageLoader />;
  if (error)
    return (
      <ErrorBox
        error={error.status === 404 ? new Error("Order not found") : error}
      />
    );

  function onCancel() {
    if (!window.confirm("Cancel this order?")) return;
    cancel.mutate(order.id, {
      onSuccess: () => toast.success("Order cancelled"),
    });
  }

  const { shipping } = order;
  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to="/userProfile/myOrders"
        className="mb-6 inline-block text-sm text-gray-600 hover:text-gray-900"
      >
        ← All orders
      </Link>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {order.orderNumber}
          </h1>
          <p className="text-sm text-gray-500">
            Placed {dateTime(order.createdAt)}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="space-y-4">
        <Card className="space-y-3">
          {order.items.map((item) => (
            <div key={`${item.productId}`} className="flex items-center gap-4">
              <ProductImage
                product={{ imageUrl: item.imageUrl, name: item.productName }}
                className="size-16 rounded-lg"
              />
              <div className="flex-1">
                <Link
                  to={`/productDetails/${item.productId}`}
                  className="font-medium text-gray-900 hover:underline"
                >
                  {item.productName}
                </Link>
                <p className="text-sm text-gray-500">
                  {item.quantity} × {money(item.unitPrice)}
                </p>
              </div>
              <span className="font-semibold">{money(item.lineTotal)}</span>
            </div>
          ))}
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="space-y-1 text-sm text-gray-700">
            <h2 className="mb-1 font-semibold text-gray-900">
              Delivery address
            </h2>
            <p>{shipping.recipientName}</p>
            <p>
              {shipping.street}, {shipping.city}
              {shipping.district && `, ${shipping.district}`}
            </p>
            {shipping.landmark && <p>Near {shipping.landmark}</p>}
            <p>{shipping.phone}</p>
            {order.notes && (
              <p className="pt-2 text-gray-500">Note: {order.notes}</p>
            )}
          </Card>
          <Card className="space-y-1 text-sm text-gray-700">
            <h2 className="mb-1 font-semibold text-gray-900">Payment</h2>
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{money(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span>
                {Number(order.deliveryFee) === 0
                  ? "Free"
                  : money(order.deliveryFee)}
              </span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-semibold text-gray-900">
              <span>Total</span>
              <span className="text-purple-600">{money(order.total)}</span>
            </div>
            <p className="pt-2 text-gray-500">
              Cash on delivery · {titleCase(order.paymentStatus)}
            </p>
          </Card>
        </div>

        {order.cancellable && (
          <Button
            variant="danger"
            className="border border-red-200"
            onClick={onCancel}
            disabled={cancel.isPending}
          >
            Cancel order
          </Button>
        )}
        {order.status === "DELIVERED" && (
          <p className="text-sm text-gray-600">
            Delivered. You can now review these products on their pages.
          </p>
        )}
      </div>
    </div>
  );
}
