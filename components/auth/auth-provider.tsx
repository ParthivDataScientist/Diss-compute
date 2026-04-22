"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { AppUser } from "@/lib/auth/types";

type SafeUser = Omit<AppUser, "password">;

type AuthContextType = {
  user: SafeUser | null;
  loading: boolean;
  refresh: () => void;
};

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, refresh: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      setUser(res.ok ? await res.json() : null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  return (
    <AuthContext.Provider value={{ user, loading, refresh: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
