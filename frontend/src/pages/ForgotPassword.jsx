import { Link } from "react-router-dom";
import { Card } from "../components/ui";
import { EMAIL, PHONENO } from "../lib/constants";

// The backend has no password-reset email yet, so point people to the shop.
export default function ForgotPassword() {
  return (
    <div className="mx-auto max-w-md py-8">
      <Card className="space-y-3 text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Forgot your password?
        </h1>
        <p className="text-gray-600">
          Online password reset is not available yet. Please contact the shop
          and we will help you get back into your account.
        </p>
        <p className="text-sm text-gray-700">
          {PHONENO} · {EMAIL}
        </p>
        <p className="text-sm text-gray-600">
          Remembered it?{" "}
          <Link
            to="/login"
            className="font-bold text-purple-600 hover:underline"
          >
            Back to login
          </Link>
        </p>
      </Card>
    </div>
  );
}
