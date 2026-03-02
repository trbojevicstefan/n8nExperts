import { useCallback, useEffect, useState, type ReactNode } from "react";
import type { Role, User } from "@/types";
import { authApi } from "@/lib/api";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const response = await authApi.me();
      setUser(response.data);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = async ({ username, password }: { username: string; password: string }) => {
    const response = await authApi.login({ username, password });
    setUser(response.data);
  };

  const register = async (data: {
    username: string;
    email: string;
    password: string;
    country?: string;
    role: Role;
  }) => {
    const response = await authApi.register(data);
    setUser(response.data.user);
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
