import { useState } from "react";
import toast from "react-hot-toast";
import { useAdminOrders, useUpdateOrderStatus } from "../../api/admin";
import {
  Card,
  ErrorBox,
  PageLoader,
  Pagination,
  StatusBadge,
} from "../../components/ui";
import { Button } from "../../components/ui";
import { NEXT_STATUS } from "../../lib/constants";
import { dateTime, money, titleCase } from "../../lib/format";

const FILTERS = [
  "",
  "PLACED",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export default function AdminOrders() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const { data, isLoading, error } = useAdminOrders({ status, page, size: 10 });
  const update = useUpdateOrderStatus();

  function move(order, next) {
    const verb = next === "CANCELLED" ? "Cancel" : `Mark as ${titleCase(next)}`;
    if (
      next === "CANCELLED" &&
      !window.confirm(`Cancel ${order.orderNumber}? Stock will be returned.`)
    )
      return;
    update.mutate(
      { id: order.id, status: next },
      {
        onSuccess: () =>
          toast.success(`${order.orderNumber}: ${verb.toLowerCase()}`),
      },
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((value) => (
          <button
            key={value || "all"}
            onClick={() => {
              setStatus(value);
              setPage(0);
            }}
            className={`cursor-pointer rounded-full px-3 py-1 text-sm ${status === value ? "bg-gray-900 text-white" : "border border-gray-300 hover:bg-gray-100"}`}
          >
            {value ? titleCase(value) : "All"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <PageLoader />
      ) : error ? (
        <ErrorBox error={error} />
      ) : data.content.length === 0 ? (
        <p className="py-10 text-center text-gray-600">No orders.</p>
      ) : (
        <div className="space-y-4">
          {data.content.map((order) => (
            <Card key={order.id} className="space-y-3 text-sm text-gray-700">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-base font-semibold text-gray-900">
                    {order.orderNumber}
                  </p>
                  <p className="text-xs text-gray-500">
                    {dateTime(order.createdAt)}
                  </p>
                </div>
                <StatusBadge status={order.status} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="font-medium text-gray-900">
                    {order.customer.fullName}
                  </p>
                  <p>{order.customer.email}</p>
                  <p>
                    {order.shipping.recipientName} · {order.shipping.phone}
                  </p>
                  <p>
                    {order.shipping.street}, {order.shipping.city}
                    {order.shipping.landmark &&
                      ` (near ${order.shipping.landmark})`}
                  </p>
                  {order.notes && (
                    <p className="text-gray-500">Note: {order.notes}</p>
                  )}
                </div>
                <ul>
                  {order.items.map((item) => (
                    <li key={item.productId}>
                      {item.quantity} × {item.productName}
                    </li>
                  ))}
                  <li className="pt-1 font-semibold text-purple-600">
                    {money(order.total)} · COD {titleCase(order.paymentStatus)}
                  </li>
                </ul>
              </div>
              {NEXT_STATUS[order.status].length > 0 && (
                <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-3">
                  {NEXT_STATUS[order.status].map((next) => (
                    <Button
                      key={next}
                      size="sm"
                      variant={next === "CANCELLED" ? "danger" : "default"}
                      className={
                        next === "CANCELLED" ? "border border-red-200" : ""
                      }
                      disabled={update.isPending}
                      onClick={() => move(order, next)}
                    >
                      {next === "CANCELLED"
                        ? "Cancel order"
                        : `Mark ${titleCase(next)}`}
                    </Button>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
      <Pagination
        page={data?.page ?? 0}
        totalPages={data?.totalPages}
        onChange={setPage}
      />
    </div>
  );
}
