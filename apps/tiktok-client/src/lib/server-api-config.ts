import { cookies } from "next/headers";
import { createClient } from "@vibe/shared";

// Custom fetch wrapper to disable Next.js aggressive fetch caching during build/SSR
// Uses revalidate instead of no-store to keep static generation working
const revalidatedFetch: typeof globalThis.fetch = async (input, init) => {
  try {
    return await globalThis.fetch(input, {
      ...init,
      next: { revalidate: 60 },
    } as RequestInit);
  } catch (error) {
    // Check if this is a network error (like ECONNREFUSED)
    const isNetworkError =
      error instanceof Error &&
      (error.message.includes("ECONNREFUSED") || error.message.includes("fetch failed"));

    // During build or SSR, if the backend is down, we return a dummy response
    // to prevent the build from crashing.
    if (isNetworkError) {
      console.warn(`[Build Resilience] Failed to fetch ${input}. Returning empty response to prevent build crash.`);
      return new Response(
        JSON.stringify({
          data: [],
          status: false,
          message: "Backend offline during build",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Re-throw if it's not a handled network error
    throw error;
  }
};

export const getServerApiClient = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(process.env.NEXT_PUBLIC_API_COOKIE_TOKEN || "access_token")?.value;

  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3333/api/v1";
  const BASE_URL = envUrl.replace(/\/api\/v1\/?$/, "");

  const serverClient = createClient({
    baseUrl: BASE_URL,
    fetch: revalidatedFetch,
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  return serverClient;
};

export const getPublicServerApiClient = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3333/api/v1";
  const BASE_URL = envUrl.replace(/\/api\/v1\/?$/, "");

  return createClient({
    baseUrl: BASE_URL,
    fetch: revalidatedFetch,
  });
};
