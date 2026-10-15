import { Card } from "./ui";
import { money } from "../lib/format";
import { FREE_DELIVERY_FROM } from "../lib/constants";

/** Totals box shared by the cart and checkout pages. `cart` is the backend CartResponse. */
export default function OrderSummary({ cart, children }) {
  const remaining = FREE_DELIVERY_FROM - Number(cart.subtotal);
  return (
    <Card className="h-fit space-y-3">
      <h2 className="text-lg font-semibold text-gray-900">Order summary</h2>
      <div className="flex justify-between text-gray-700">
        <span>Subtotal ({cart.itemCount} items)</span>
        <span>{money(cart.subtotal)}</span>
      </div>
      <div className="flex justify-between text-gray-700">
        <span>Delivery</span>
        <span>
          {Number(cart.deliveryFee) === 0 ? "Free" : money(cart.deliveryFee)}
        </span>
      </div>
      {remaining > 0 && (
        <p className="text-xs text-gray-500">
          Add {money(remaining)} more for free delivery.
        </p>
      )}
      <div className="flex justify-between border-t border-gray-200 pt-3 text-lg font-semibold text-gray-900">
        <span>Total</span>
        <span className="text-purple-600">{money(cart.total)}</span>
      </div>
      <p className="text-xs text-gray-500">Payment: cash on delivery</p>
      {children}
    </Card>
  );
}
