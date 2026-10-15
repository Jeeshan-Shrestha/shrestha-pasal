import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAuth } from "../auth/AuthContext";

/* ---------- cart ---------- */

export function useCart() {
  const { isLoggedIn } = useAuth();
  return useQuery({
    queryKey: ["cart"],
    queryFn: () => api("/cart"),
    enabled: isLoggedIn,
  });
}

function useCartMutation(fn) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (cart) => {
      if (cart) queryClient.setQueryData(["cart"], cart);
      else queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export const useAddToCart = () =>
  useCartMutation(({ productId, quantity = 1 }) =>
    api("/cart/items", { method: "POST", body: { productId, quantity } }),
  );

export const useSetCartQuantity = () =>
  useCartMutation(({ productId, quantity }) =>
    api(`/cart/items/${productId}`, { method: "PUT", body: { quantity } }),
  );

export const useRemoveFromCart = () =>
  useCartMutation((productId) =>
    api(`/cart/items/${productId}`, { method: "DELETE" }),
  );

/* ---------- wishlist ---------- */

export function useWishlist() {
  const { isLoggedIn } = useAuth();
  return useQuery({
    queryKey: ["wishlist"],
    queryFn: () => api("/wishlist"),
    enabled: isLoggedIn,
  });
}

export function useToggleWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, saved }) =>
      api(`/wishlist/${productId}`, { method: saved ? "DELETE" : "PUT" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wishlist"] }),
  });
}

/* ---------- addresses ---------- */

export function useAddresses() {
  const { isLoggedIn } = useAuth();
  return useQuery({
    queryKey: ["addresses"],
    queryFn: () => api("/addresses"),
    enabled: isLoggedIn,
  });
}

export function useSaveAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }) =>
      id
        ? api(`/addresses/${id}`, { method: "PUT", body })
        : api("/addresses", { method: "POST", body }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["addresses"] }),
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api(`/addresses/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["addresses"] }),
  });
}

/* ---------- orders ---------- */

export function useOrders(page) {
  const { isLoggedIn } = useAuth();
  return useQuery({
    queryKey: ["orders", page],
    queryFn: () => api("/orders", { params: { page, size: 10 } }),
    enabled: isLoggedIn,
    placeholderData: keepPreviousData,
  });
}

export function useOrder(id) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => api(`/orders/${id}`),
    retry: false,
  });
}

export function usePlaceOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body) => api("/orders", { method: "POST", body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api(`/orders/${id}/cancel`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order"] });
    },
  });
}

/* ---------- account ---------- */

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body) => api("/users/me", { method: "PUT", body }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["me"] }),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (body) => api("/users/me/password", { method: "PUT", body }),
  });
}
