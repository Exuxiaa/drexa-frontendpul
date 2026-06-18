import { useState, useCallback } from "react";
import { api } from "@/lib/api";
import { loginWithGoogleBackend } from "./backendAuth";
import { useGoogleLogin } from "@react-oauth/google";

interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar: string;
  provider: "google";
}

type AuthStatus = "idle" | "loading" | "success" | "error";

interface UseGoogleAuthReturn {
  status: AuthStatus;
  user: AuthUser | null;
  error: string | null;
  isLoading: boolean;
  login: () => void;
  logout: () => Promise<void>;
}

export const useGoogleAuth = (onSuccessCallback?: () => void): UseGoogleAuthReturn => {
  const [status, setStatus] = useState<AuthStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setStatus("loading");
      try {
        await loginWithGoogleBackend(tokenResponse.access_token);
        setUser({ id: "", email: "", name: "", avatar: "", provider: "google" });
        setStatus("success");
        if (onSuccessCallback) onSuccessCallback();
      } catch (err: any) {
        setError(err.message || "Google login failed");
        setStatus("error");
      }
    },
    onError: (errorResponse) => {
      setError("Google login was canceled or failed.");
      setStatus("error");
    },
  });

  const logout = useCallback(async () => {
    await api.post("/auth/logout").catch(() => {});
    setUser(null);
    setStatus("idle");
    setError(null);
  }, []);

  return { status, user, error, isLoading: status === "loading", login: login as any, logout };
};
