import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useSaveAddress } from "../api/shop";
import { Button, Field, inputClass } from "./ui";

/** Create (no `address`) or edit an address. Calls onDone(savedAddress) on success. */
export default function AddressForm({ address, onDone, onCancel }) {
  const save = useSaveAddress();
  const { register, handleSubmit, formState } = useForm({
    defaultValues: {
      label: address?.label ?? "",
      recipientName: address?.recipientName ?? "",
      phone: address?.phone ?? "",
      street: address?.street ?? "",
      city: address?.city ?? "",
      district: address?.district ?? "",
      landmark: address?.landmark ?? "",
      defaultAddress: address?.defaultAddress ?? false,
    },
  });
  const { errors } = formState;

  function onSubmit(values) {
    save.mutate(
      { id: address?.id, ...values },
      {
        onSuccess: (saved) => {
          toast.success("Address saved");
          onDone?.(saved);
        },
      },
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Label (Home, Office...)">
          <input className={inputClass} {...register("label")} />
        </Field>
        <Field label="Recipient name" error={errors.recipientName?.message}>
          <input
            className={inputClass}
            {...register("recipientName", { required: "Required" })}
          />
        </Field>
        <Field label="Phone" error={errors.phone?.message}>
          <input
            className={inputClass}
            inputMode="tel"
            {...register("phone", {
              required: "Required",
              pattern: {
                value: /^\+?[0-9]{7,15}$/,
                message: "Enter 7-15 digits",
              },
            })}
          />
        </Field>
        <Field label="City" error={errors.city?.message}>
          <input
            className={inputClass}
            {...register("city", { required: "Required" })}
          />
        </Field>
      </div>
      <Field label="Street address" error={errors.street?.message}>
        <input
          className={inputClass}
          {...register("street", { required: "Required" })}
        />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="District">
          <input className={inputClass} {...register("district")} />
        </Field>
        <Field label="Landmark">
          <input className={inputClass} {...register("landmark")} />
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" {...register("defaultAddress")} />
        Use as my default address
      </label>
      <div className="flex gap-2">
        <Button type="submit" disabled={save.isPending}>
          Save address
        </Button>
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
