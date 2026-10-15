import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import toast, { Toaster } from "react-hot-toast";
import { AuthProvider } from "./auth/AuthContext";
import Layout from "./components/Layout";
import { RequireAdmin, RequireAuth } from "./components/guards";

import HomePage from "./pages/HomePage";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import WishList from "./pages/WishList";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import MyOrders from "./pages/MyOrders";
import OrderDetail from "./pages/OrderDetail";
import UserProfile from "./pages/UserProfile";
import EditUser from "./pages/EditUser";
import Addresses from "./pages/Addresses";
import NotFound from "./pages/NotFound";
import {
  About,
  ContactUs,
  FAQ,
  Help,
  Returns,
  ShippingInfo,
  TermsAndConditions,
} from "./pages/InfoPages";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminUsers from "./pages/admin/AdminUsers";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      // public
      { path: "/", element: <HomePage /> },
      { path: "/productDetails/:productId", element: <ProductDetail /> },
      { path: "/login", element: <Login /> },
      { path: "/registerUser", element: <Register /> },
      { path: "/forgotPassword", element: <ForgotPassword /> },
      { path: "/about", element: <About /> },
      { path: "/contactUs", element: <ContactUs /> },
      { path: "/frequentlyAskedQuestions", element: <FAQ /> },
      { path: "/shippingInfo", element: <ShippingInfo /> },
      { path: "/returns", element: <Returns /> },
      { path: "/help/customer", element: <Help /> },
      { path: "/termsAndConditions", element: <TermsAndConditions /> },

      // needs login
      {
        element: <RequireAuth />,
        children: [
          { path: "/cart", element: <Cart /> },
          { path: "/wishlist", element: <WishList /> },
          { path: "/order/checkout", element: <Checkout /> },
          { path: "/order/success/:orderId", element: <OrderSuccess /> },
          { path: "/userProfile", element: <UserProfile /> },
          { path: "/userProfile/editProfile", element: <EditUser /> },
          { path: "/userProfile/addresses", element: <Addresses /> },
          { path: "/userProfile/myOrders", element: <MyOrders /> },
          { path: "/userProfile/myOrders/:orderId", element: <OrderDetail /> },
        ],
      },

      // admin only
      {
        element: <RequireAuth />,
        children: [
          {
            element: <RequireAdmin />,
            children: [
              {
                path: "/admin",
                element: <AdminLayout />,
                children: [
                  { index: true, element: <Navigate to="orders" replace /> },
                  { path: "orders", element: <AdminOrders /> },
                  { path: "products", element: <AdminProducts /> },
                  { path: "categories", element: <AdminCategories /> },
                  { path: "users", element: <AdminUsers /> },
                ],
              },
            ],
          },
        ],
      },

      { path: "*", element: <NotFound /> },
    ],
  },
]);

// Any failed mutation shows its message as a toast, so components only handle success.
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60 * 1000, retry: 1 } },
  mutationCache: new MutationCache({
    onError: (error) => toast.error(error.message),
  }),
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{ style: { fontSize: "15px" } }}
      />
    </QueryClientProvider>
  );
}
