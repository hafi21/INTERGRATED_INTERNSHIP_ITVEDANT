import { useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { AuthContext, type AuthContextValue } from "./auth-context";
import { authService } from "../services/auth";
import type { User } from "../types";

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      if (!authService.hasToken()) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch {
        authService.logout();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    void bootstrap();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      async login(payload) {
        const response = await authService.login(payload);
        setUser(response.user);
        return response.user;
      },
      async register(payload) {
        const response = await authService.register(payload);
        setUser(response.user);
        return response.user;
      },
      logout() {
        authService.logout();
        setUser(null);
      },
    }),
    [loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

