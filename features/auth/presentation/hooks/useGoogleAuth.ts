import { useState, useCallback } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/features/core/store/firebase";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar: string;
  provider: "google";
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthSession extends AuthTokens {
  user: AuthUser;
}

type AuthStatus = "idle" | "loading" | "success" | "error";

interface UseGoogleAuthReturn {
  status: AuthStatus;
  user: AuthUser | null;
  error: string | null;
  isLoading: boolean;
  login: () => Promise<AuthSession | null>;
  logout: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TOKEN_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useGoogleAuth = (): UseGoogleAuthReturn => {
  const [status, setStatus] = useState<AuthStatus>("idle");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (): Promise<AuthSession | null> => {
    setStatus("loading");
    setError(null);
    
    const provider = new GoogleAuthProvider();

    try {
      // Step 1: Firebase popup → get Google ID token
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      // Step 2: Hand off to your backend
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: idToken }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Authentication failed");
      }

      const session: AuthSession = await res.json();

      // Step 3: Persist YOUR tokens
      localStorage.setItem(TOKEN_KEY, session.accessToken);
      localStorage.setItem(REFRESH_KEY, session.refreshToken);

      // Step 4: Kill the Firebase session — we're done with it
      await auth.signOut();

      setUser(session.user);
      setStatus("success");

      return session;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Unknown error occurred";

      // Don't surface Firebase popup-closed as an error
      if ((err as { code?: string })?.code === "auth/popup-closed-by-user") {
        setStatus("idle");
        return null;
      }

      setError(message);
      setStatus("error");
      return null;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    setUser(null);
    setStatus("idle");
    setError(null);
  }, []);

  return {
    status,
    user,
    error,
    isLoading: status === "loading",
    login,
    logout,
  };
};