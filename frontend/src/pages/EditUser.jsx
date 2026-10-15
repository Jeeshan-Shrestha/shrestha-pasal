import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useAuth } from "../auth/AuthContext";
import { useChangePassword, useUpdateProfile } from "../api/shop";
import { Button, Card, Field, PageTitle, inputClass } from "../components/ui";

function ProfileForm({ user }) {
  const update = useUpdateProfile();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { fullName: user.fullName, phone: user.phone ?? "" },
  });

  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold">Profile</h2>
      <form
        className="space-y-4"
        onSubmit={handleSubmit((values) =>
          update.mutate(values, {
            onSuccess: () => toast.success("Profile updated"),
          }),
        )}
      >
        <Field label="Email">
          <input
            className={`${inputClass} bg-gray-50`}
            value={user.email}
            disabled
            readOnly
          />
        </Field>
        <Field label="Full name" error={errors.fullName?.message}>
          <input
            className={inputClass}
            {...register("fullName", { required: "Required" })}
          />
        </Field>
        <Field label="Phone" error={errors.phone?.message}>
          <input
            inputMode="tel"
            className={inputClass}
            {...register("phone", {
              pattern: {
                value: /^\+?[0-9]{7,15}$/,
                message: "Enter 7-15 digits",
              },
            })}
          />
        </Field>
        <Button type="submit" disabled={update.isPending}>
          Save changes
        </Button>
      </form>
    </Card>
  );
}

function PasswordForm() {
  const change = useChangePassword();
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm();

  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold">Change password</h2>
      <form
        className="space-y-4"
        onSubmit={handleSubmit(({ currentPassword, newPassword }) =>
          change.mutate(
            { currentPassword, newPassword },
            {
              onSuccess: () => {
                toast.success("Password changed");
                reset();
              },
            },
          ),
        )}
      >
        <Field label="Current password">
          <input
            type="password"
            autoComplete="current-password"
            className={inputClass}
            {...register("currentPassword", { required: true })}
          />
        </Field>
        <Field label="New password" error={errors.newPassword?.message}>
          <input
            type="password"
            autoComplete="new-password"
            className={inputClass}
            {...register("newPassword", {
              required: "Required",
              minLength: { value: 8, message: "At least 8 characters" },
              maxLength: { value: 72, message: "At most 72 characters" },
            })}
          />
        </Field>
        <Field label="Confirm new password" error={errors.confirm?.message}>
          <input
            type="password"
            autoComplete="new-password"
            className={inputClass}
            {...register("confirm", {
              validate: (value) =>
                value === getValues("newPassword") || "Passwords do not match",
            })}
          />
        </Field>
        <Button type="submit" disabled={change.isPending}>
          Update password
        </Button>
      </form>
    </Card>
  );
}

export default function EditUser() {
  const { user } = useAuth();
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Link
        to="/userProfile"
        className="inline-block text-sm text-gray-600 hover:text-gray-900"
      >
        ← My account
      </Link>
      <PageTitle>Edit profile</PageTitle>
      <ProfileForm user={user} />
      <PasswordForm />
    </div>
  );
}
