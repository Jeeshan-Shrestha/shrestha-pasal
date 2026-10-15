import { useState } from "react";
import { Link } from "react-router-dom";
import { useOrders } from "../api/shop";
import {
  Button,
  Card,
  Empty,
  ErrorBox,
  PageLoader,
  PageTitle,
  Pagination,
  StatusBadge,
} from "../components/ui";
import { dateTime, money } from "../lib/format";

export default function MyOrders() {
  const [page, setPage] = useState(0);
  const { data, isLoading, error, refetch } = useOrders(page);

  if (isLoading) return <PageLoader />;
  if (error) return <ErrorBox error={error} onRetry={refetch} />;
  if (data.content.length === 0) {
    return (
      <Empty
        title="No orders yet"
        text="When you place an order it will show up here."
        action={<Button to="/">Start shopping</Button>}
      />
    );
  }

  return (
    <div>
      <PageTitle>My orders</PageTitle>
      <div className="space-y-4">
        {data.content.map((order) => (
          <Link
            key={order.id}
            to={`/userProfile/myOrders/${order.id}`}
            className="block"
          >
            <Card className="transition-shadow hover:shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-gray-900">
                    {order.orderNumber}
                  </p>
                  <p className="text-sm text-gray-500">
                    {dateTime(order.createdAt)}
                  </p>
                </div>
                <StatusBadge status={order.status} />
              </div>
              <p className="mt-3 line-clamp-1 text-sm text-gray-700">
                {order.items
                  .map((item) => `${item.productName} × ${item.quantity}`)
                  .join(", ")}
              </p>
              <p className="mt-2 font-semibold text-purple-600">
                {money(order.total)}
              </p>
            </Card>
          </Link>
        ))}
      </div>
      <Pagination
        page={data.page}
        totalPages={data.totalPages}
        onChange={setPage}
      />
    </div>
  );
}
