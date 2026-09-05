import apiClient from "@/lib/api/client";

/**
 * Auth is backed by NextAuth (Credentials provider) running on the backend
 * service — see Docs/api/phase-1-employee-user.md "Login screen" row.
 * We drive its endpoints directly (rather than the `next-auth/react` client,
 * which assumes NextAuth lives in the same app) since frontend and backend
 * are separate Next.js apps here.
 */

async function getCsrfToken() {
  const { data } = await apiClient.get("/api/auth/csrf");
  return data.csrfToken;
}

export async function login({ email, password }) {
  const csrfToken = await getCsrfToken();
  await apiClient.post(
    "/api/auth/callback/credentials",
    new URLSearchParams({ email, password, csrfToken, json: "true" }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );
  return getSession();
}

export async function logout() {
  const csrfToken = await getCsrfToken();
  await apiClient.post(
    "/api/auth/signout",
    new URLSearchParams({ csrfToken, json: "true" }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );
}

export async function getSession() {
  const { data } = await apiClient.get("/api/auth/session");
  return data?.user ? data : null;
}
