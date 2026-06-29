import Cookies from "js-cookie";

const TOKEN_KEY = process.env.NEXT_PUBLIC_API_COOKIE_TOKEN || "access_token";
const COOKIE_DOMAIN = process.env.NEXT_PUBLIC_API_COOKIE_DOMAIN;

export const auth = {
  getToken: () => Cookies.get(TOKEN_KEY),

  setToken: (token: string) => {
    Cookies.set(TOKEN_KEY, token, {
      expires: 1,
      path: "/",
      sameSite: "Lax",
      ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}),
    });
  },

  removeToken: () => {
    Cookies.remove(TOKEN_KEY, { path: "/" });
    if (COOKIE_DOMAIN) {
      Cookies.remove(TOKEN_KEY, { path: "/", domain: COOKIE_DOMAIN });
      Cookies.remove(TOKEN_KEY, { path: "/", domain: "." + COOKIE_DOMAIN });
    }
    // Fallback direct cookie clearing
    document.cookie = `${TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    if (COOKIE_DOMAIN) {
      document.cookie = `${TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${COOKIE_DOMAIN};`;
      document.cookie = `${TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${COOKIE_DOMAIN};`;
    }
  },

  clear: () => {
    Cookies.remove(TOKEN_KEY, { path: "/" });
    if (COOKIE_DOMAIN) {
      Cookies.remove(TOKEN_KEY, { path: "/", domain: COOKIE_DOMAIN });
      Cookies.remove(TOKEN_KEY, { path: "/", domain: "." + COOKIE_DOMAIN });
    }
    // Fallback direct cookie clearing
    document.cookie = `${TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    if (COOKIE_DOMAIN) {
      document.cookie = `${TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${COOKIE_DOMAIN};`;
      document.cookie = `${TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${COOKIE_DOMAIN};`;
    }
  },

  isAuthenticated: () => {
    return !!Cookies.get(TOKEN_KEY);
  },
};
