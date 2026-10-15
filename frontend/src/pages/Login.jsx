import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import { useAuth } from "../auth/AuthContext";
import { Button, Card, Field, inputClass } from "../components/ui";

export default function Login() {
  const { login, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/";
  const { register, handleSubmit } = useForm();

  const mutation = useMutation({
    mutationFn: (body) => api("/auth/login", { method: "POST", body }),
    onSuccess: (data) => {
      login(data.token);
      toast.success(`Welcome back, ${data.user.fullName.split(" ")[0]}!`);
      navigate(redirectTo, { replace: true });
    },
  });

  if (isLoggedIn && !mutation.isPending)
    return <Navigate to={redirectTo} replace />;

  return (
    <div className="mx-auto max-w-md py-8">
      <Card>
        <div className="mb-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-sm text-gray-600">
            Log in to your account to continue
          </p>
        </div>
        <form
          className="space-y-4"
          onSubmit={handleSubmit((values) => mutation.mutate(values))}
        >
          <Field label="Email">
            <input
              type="email"
              required
              autoComplete="email"
              className={inputClass}
              {...register("email")}
            />
          </Field>
          <Field label="Password">
            <input
              type="password"
              required
              autoComplete="current-password"
              className={inputClass}
              {...register("password")}
            />
          </Field>
          <div className="text-right">
            <Link
              to="/forgotPassword"
              className="text-sm font-semibold text-purple-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Logging in..." : "Login"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link
            to="/registerUser"
            state={location.state}
            className="font-bold text-purple-600 hover:underline"
          >
            Register here
          </Link>
        </p>
      </Card>
    </div>
  );
}
