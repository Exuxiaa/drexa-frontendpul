"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";

export function Providers({ children }: { children: ReactNode }) {
  // One client per browser session — created lazily so it survives re-renders
  // but is never shared across requests on the server.
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider
        clientId={
          process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
          "dummy-client-id.apps.googleusercontent.com"
        }
      >
        {children}
      </GoogleOAuthProvider>
    </QueryClientProvider>
  );
}
