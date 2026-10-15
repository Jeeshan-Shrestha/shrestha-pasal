import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAddresses, useDeleteAddress } from "../api/shop";
import AddressForm from "../components/AddressForm";
import {
  Badge,
  Button,
  Card,
  ErrorBox,
  PageLoader,
  PageTitle,
} from "../components/ui";

export default function Addresses() {
  const { data: addresses, isLoading, error } = useAddresses();
  const remove = useDeleteAddress();
  const [editing, setEditing] = useState(null); // address being edited, or "new"

  if (isLoading) return <PageLoader />;
  if (error) return <ErrorBox error={error} />;

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        to="/userProfile"
        className="mb-6 inline-block text-sm text-gray-600 hover:text-gray-900"
      >
        ← My account
      </Link>
      <PageTitle>My addresses</PageTitle>

      {editing ? (
        <Card>
          <h2 className="mb-4 text-lg font-semibold">
            {editing === "new" ? "New address" : "Edit address"}
          </h2>
          <AddressForm
            address={editing === "new" ? undefined : editing}
            onDone={() => setEditing(null)}
            onCancel={() => setEditing(null)}
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {addresses.length === 0 && (
            <p className="text-gray-600">No saved addresses yet.</p>
          )}
          {addresses.map((address) => (
            <Card
              key={address.id}
              className="flex flex-wrap items-start justify-between gap-3"
            >
              <div className="text-sm text-gray-700">
                <p className="mb-1 flex items-center gap-2 font-semibold text-gray-900">
                  {address.recipientName}
                  {address.label && (
                    <span className="font-normal text-gray-500">
                      · {address.label}
                    </span>
                  )}
                  {address.defaultAddress && <Badge>Default</Badge>}
                </p>
                <p>
                  {address.street}, {address.city}
                  {address.district && `, ${address.district}`}
                </p>
                {address.landmark && <p>Near {address.landmark}</p>}
                <p>{address.phone}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(address)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  disabled={remove.isPending}
                  onClick={() => {
                    if (window.confirm("Delete this address?")) {
                      remove.mutate(address.id, {
                        onSuccess: () => toast.success("Address deleted"),
                      });
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
          <Button onClick={() => setEditing("new")}>+ Add address</Button>
        </div>
      )}
    </div>
  );
}
