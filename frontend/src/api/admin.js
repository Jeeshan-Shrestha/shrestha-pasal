import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "../lib/api";

function useInvalidating(fn, keys) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () =>
      keys.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] })),
  });
}

/* ---------- products ---------- */

export function useAdminProducts(params) {
  return useQuery({
    queryKey: ["admin-products", params],
    queryFn: () => api("/admin/products", { params }),
    placeholderData: keepPreviousData,
  });
}

export const useSaveProduct = () =>
  useInvalidating(
    ({ id, ...body }) =>
      id
        ? api(`/products/${id}`, { method: "PUT", body })
        : api("/products", { method: "POST", body }),
    ["admin-products", "products", "product"],
  );

export const useDeactivateProduct = () =>
  useInvalidating(
    (id) => api(`/products/${id}`, { method: "DELETE" }),
    ["admin-products", "products", "product"],
  );

/* ---------- categories ---------- */

export const useSaveCategory = () =>
  useInvalidating(
    ({ id, ...body }) =>
      id
        ? api(`/categories/${id}`, { method: "PUT", body })
        : api("/categories", { method: "POST", body }),
    ["categories"],
  );

export const useDeleteCategory = () =>
  useInvalidating(
    (id) => api(`/categories/${id}`, { method: "DELETE" }),
    ["categories"],
  );

/* ---------- orders ---------- */

export function useAdminOrders(params) {
  return useQuery({
    queryKey: ["admin-orders", params],
    queryFn: () => api("/admin/orders", { params }),
    placeholderData: keepPreviousData,
  });
}

export const useUpdateOrderStatus = () =>
  useInvalidating(
    ({ id, status }) =>
      api(`/admin/orders/${id}/status`, { method: "PATCH", body: { status } }),
    ["admin-orders", "products"],
  );

/* ---------- users ---------- */

export function useAdminUsers(page) {
  return useQuery({
    queryKey: ["admin-users", page],
    queryFn: () => api("/admin/users", { params: { page, size: 20 } }),
    placeholderData: keepPreviousData,
  });
}

export const useSetUserEnabled = () =>
  useInvalidating(
    ({ id, value }) =>
      api(`/admin/users/${id}/enabled`, { method: "PATCH", params: { value } }),
    ["admin-users"],
  );
