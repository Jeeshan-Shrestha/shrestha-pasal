import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LuMapPin } from "react-icons/lu";
import { useAddresses, useCart, usePlaceOrder } from "../api/shop";
import AddressForm from "../components/AddressForm";
import OrderSummary from "../components/OrderSummary";
import {
  Button,
  Card,
  ErrorBox,
  Field,
  PageLoader,
  PageTitle,
  inputClass,
} from "../components/ui";

export default function Checkout() {
  const navigate = useNavigate();
  const { data: cart, isLoading: cartLoading, error: cartError } = useCart();
  const { data: addresses, isLoading: addressesLoading } = useAddresses();
  const placeOrder = usePlaceOrder();

  const [chosenId, setChosenId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [notes, setNotes] = useState("");

  if (cartLoading || addressesLoading) return <PageLoader />;
  if (cartError) return <ErrorBox error={cartError} />;

  if (cart.items.length === 0) {
    return (
      <div className="py-16 text-center">
        <h2 className="mb-4 text-xl font-semibold">Your cart is empty</h2>
        <Button to="/">Continue shopping</Button>
      </div>
    );
  }

  // default to the user's default address until they pick another
  const selectedId =
    chosenId ??
    addresses.find((a) => a.defaultAddress)?.id ??
    addresses[0]?.id ??
    null;
  const showForm = adding || addresses.length === 0;
  const blocked = cart.items.some((item) => !item.available);

  function submit() {
    placeOrder.mutate(
      { addressId: selectedId, notes: notes.trim() || null },
      {
        onSuccess: (order) =>
          navigate(`/order/success/${order.id}`, { replace: true }),
      },
    );
  }

  return (
    <div>
      <Link
        to="/cart"
        className="mb-6 inline-block text-sm text-gray-600 hover:text-gray-900"
      >
        ← Back to cart
      </Link>
      <PageTitle>Checkout</PageTitle>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="space-y-4">
            <div className="flex items-center gap-3">
              <LuMapPin className="h-5 w-5 text-purple-600" />
              <h2 className="text-lg font-semibold">Delivery address</h2>
            </div>

            {!showForm && (
              <div className="space-y-3">
                {addresses.map((address) => (
                  <label
                    key={address.id}
                    className={`flex cursor-pointer gap-3 rounded-xl border p-4 ${selectedId === address.id ? "border-purple-500 bg-purple-50" : "border-gray-200"}`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedId === address.id}
                      onChange={() => setChosenId(address.id)}
                    />
                    <span className="text-sm text-gray-700">
                      <span className="block font-semibold text-gray-900">
                        {address.recipientName}{" "}
                        {address.label && `· ${address.label}`}
                      </span>
                      {address.street}, {address.city}
                      {address.district && `, ${address.district}`}
                      {address.landmark && ` (near ${address.landmark})`}
                      <span className="block">{address.phone}</span>
                    </span>
                  </label>
                ))}
                <Button variant="outline" onClick={() => setAdding(true)}>
                  + Add a new address
                </Button>
              </div>
            )}

            {showForm && (
              <AddressForm
                onDone={(saved) => {
                  setChosenId(saved.id);
                  setAdding(false);
                }}
                onCancel={addresses.length ? () => setAdding(false) : undefined}
              />
            )}
          </Card>

          <Card className="space-y-3">
            <h2 className="text-lg font-semibold">Payment</h2>
            <div className="rounded-xl border border-purple-500 bg-purple-50 p-4 text-sm text-gray-700">
              <span className="block font-semibold text-gray-900">
                Cash on delivery
              </span>
              Pay in cash when your order arrives.
            </div>
            <Field label="Note for the shop (optional)">
              <textarea
                rows={2}
                maxLength={500}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className={inputClass}
                placeholder="e.g. Please call before delivery"
              />
            </Field>
          </Card>
        </div>

        <OrderSummary cart={cart}>
          <Button
            size="lg"
            className="w-full"
            disabled={
              showForm || !selectedId || blocked || placeOrder.isPending
            }
            onClick={submit}
          >
            {placeOrder.isPending ? "Placing order..." : "Place order"}
          </Button>
          {blocked && (
            <p className="text-sm text-red-600">
              Some items are unavailable.{" "}
              <Link to="/cart" className="underline">
                Fix your cart
              </Link>
              .
            </p>
          )}
        </OrderSummary>
      </div>
    </div>
  );
}
