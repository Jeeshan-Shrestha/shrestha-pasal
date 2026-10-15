import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "../lib/api";

export function useProducts(params) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => api("/products", { params }),
    placeholderData: keepPreviousData,
  });
}

export function useProduct(id) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => api(`/products/${id}`),
    retry: false,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => api("/categories"),
    staleTime: 10 * 60 * 1000,
  });
}

export function useReviews(productId, page) {
  return useQuery({
    queryKey: ["reviews", productId, page],
    queryFn: () =>
      api(`/products/${productId}/reviews`, { params: { page, size: 5 } }),
    placeholderData: keepPreviousData,
  });
}

export function useCreateReview(productId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (review) =>
      api(`/products/${productId}/reviews`, { method: "POST", body: review }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
