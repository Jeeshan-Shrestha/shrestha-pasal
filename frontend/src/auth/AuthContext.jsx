import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, tokenStore } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState(() => tokenStore.get());

  const { data: user, isLoading } = useQuery({
    queryKey: ["me", token],
    queryFn: () => api("/users/me"),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const logout = useCallback(() => {
    tokenStore.clear();
    setToken(null);
    queryClient.clear();
  }, [queryClient]);

  // api() fires this when the server rejects our token (expired / account disabled)
  useEffect(() => {
    window.addEventListener("pasal:unauthorized", logout);
    return () => window.removeEventListener("pasal:unauthorized", logout);
  }, [logout]);

  // User-initiated sign out: hard-navigate home so route guards cannot redirect to /login
  // and no cached account data survives in memory.
  const signOut = useCallback(() => {
    tokenStore.clear();
    window.location.assign("/");
  }, []);

  const login = useCallback(
    (newToken) => {
      queryClient.clear();
      tokenStore.set(newToken);
      setToken(newToken);
    },
    [queryClient],
  );

  const value = {
    user: token ? user : null,
    isLoggedIn: !!token,
    isAdmin: user?.role === "ADMIN",
    loading: !!token && isLoading,
    login,
    logout,
    signOut,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
