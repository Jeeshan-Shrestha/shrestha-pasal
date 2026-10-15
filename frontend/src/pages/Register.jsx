import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import { useAuth } from "../auth/AuthContext";
import { Button, Card, Field, inputClass } from "../components/ui";

export default function Register() {
  const { login, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/";
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm();

  const mutation = useMutation({
    mutationFn: (body) => api("/auth/register", { method: "POST", body }),
    onSuccess: (data) => {
      login(data.token);
      toast.success("Account created. Welcome!");
      navigate(redirectTo, { replace: true });
    },
  });

  if (isLoggedIn && !mutation.isPending) return <Navigate to="/" replace />;

  function onSubmit({ fullName, email, phone, password }) {
    mutation.mutate({ fullName, email, phone, password });
  }

  return (
    <div className="mx-auto max-w-md py-8">
      <Card>
        <div className="mb-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Create your account
          </h1>
          <p className="text-sm text-gray-600">
            Order utensils in a few clicks
          </p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Field label="Full name" error={errors.fullName?.message}>
            <input
              className={inputClass}
              {...register("fullName", { required: "Required" })}
            />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <input
              type="email"
              autoComplete="email"
              className={inputClass}
              {...register("email", { required: "Required" })}
            />
          </Field>
          <Field label="Phone (optional)" error={errors.phone?.message}>
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
          <Field label="Password" error={errors.password?.message}>
            <input
              type="password"
              autoComplete="new-password"
              className={inputClass}
              {...register("password", {
                required: "Required",
                minLength: { value: 8, message: "At least 8 characters" },
                maxLength: { value: 72, message: "At most 72 characters" },
              })}
            />
          </Field>
          <Field label="Confirm password" error={errors.confirm?.message}>
            <input
              type="password"
              autoComplete="new-password"
              className={inputClass}
              {...register("confirm", {
                validate: (value) =>
                  value === getValues("password") || "Passwords do not match",
              })}
            />
          </Field>
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Creating account..." : "Register"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            state={location.state}
            className="font-bold text-purple-600 hover:underline"
          >
            Login
          </Link>
        </p>
      </Card>
    </div>
  );
}
