import { Link, useParams } from "react-router-dom";
import { useOrder } from "../api/shop";
import { Button, Card, ErrorBox, PageLoader } from "../components/ui";
import { money } from "../lib/format";

export default function OrderSuccess() {
  const { orderId } = useParams();
  const { data: order, isLoading, error } = useOrder(orderId);

  if (isLoading) return <PageLoader />;
  if (error) return <ErrorBox error={error} />;

  return (
    <div className="mx-auto max-w-lg py-8">
      <Card className="space-y-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
          ✓
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Order placed!</h1>
        <p className="text-gray-600">
          Thank you. We&apos;ll confirm your order shortly and deliver it to{" "}
          {order.shipping.city}.
        </p>
        <div className="rounded-xl bg-gray-50 p-4 text-left text-sm text-gray-700">
          <p>
            Order number:{" "}
            <span className="font-semibold">{order.orderNumber}</span>
          </p>
          <p>
            Pay on delivery:{" "}
            <span className="font-semibold text-purple-600">
              {money(order.total)}
            </span>
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <Button to={`/userProfile/myOrders/${order.id}`}>View order</Button>
          <Button variant="outline" to="/">
            Keep shopping
          </Button>
        </div>
        <Link
          to="/userProfile/myOrders"
          className="block text-sm text-purple-600 hover:underline"
        >
          All my orders
        </Link>
      </Card>
    </div>
  );
}
