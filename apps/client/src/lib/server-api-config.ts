import { cookies } from "next/headers";
import { createClient } from "@/generated/api/client";

// Custom fetch wrapper to disable Next.js aggressive fetch caching during build/SSR
// Uses revalidate instead of no-store to keep static generation working
const revalidatedFetch: typeof globalThis.fetch = (input, init) => {
  return globalThis.fetch(input, {
    ...init,
    next: { revalidate: 60 },
  } as RequestInit);
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
