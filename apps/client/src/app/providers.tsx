"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/tiktok/ui/tooltip";
import { Toaster } from "@/components/tiktok/ui/toaster";
import { Toaster as Sonner } from "@/components/tiktok/ui/sonner";
import { AuthProvider } from "@/components/tiktok/providers/AuthProvider";
import "@/lib/openapi-config";
import { useState, useEffect } from "react";

import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      }),
  );

  useEffect(() => {
    // Dynamically configure @projects/shared client in the browser to avoid static bundling/transpilation errors in dev server
    import("@projects/shared").then(({ client: sharedClient }) => {
      const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3333";
      const BASE_URL = envUrl.replace(/\/api\/v1\/?$/, "");
      
      sharedClient.setConfig({
        baseUrl: BASE_URL,
      });

      // Add request interceptor for Authentication
      sharedClient.interceptors.request.use(async (request, options) => {
        const { auth } = await import("@/lib/auth");
        const token = auth.getToken();
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`);
        }
        return request;
      });

      // Add response interceptor for 401
      sharedClient.interceptors.response.use((response, request, options) => {
        if (response.status === 401) {
          const currentPath = window.location.pathname;
          const guestAllowedPaths = ["/orders"];
          const isGuestAllowed = guestAllowedPaths.some((p) => currentPath.startsWith(p));
          if (currentPath !== "/" && !isGuestAllowed) {
            window.location.href = "/";
          }
        }
        return response;
      });
    }).catch((err) => {
      console.error("Failed to load and configure @projects/shared client", err);
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
        <TooltipProvider>
          <AuthProvider>
            {children}
            <Toaster />
            <Sonner position="top-center" />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
