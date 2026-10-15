import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Button, Empty, PageLoader } from "./ui";

/** Wrap routes that need a logged-in user; sends guests to /login and back again afterwards. */
export function RequireAuth() {
  const { isLoggedIn, loading } = useAuth();
  const location = useLocation();
  if (loading) return <PageLoader />;
  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}

export function RequireAdmin() {
  const { isAdmin, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!isAdmin) {
    return (
      <Empty
        title="Admins only"
        text="You do not have access to this page."
        action={<Button to="/">Back to shop</Button>}
      />
    );
  }
  return <Outlet />;
}
