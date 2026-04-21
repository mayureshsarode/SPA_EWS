const API_BASE = "http://localhost:5000/api";

/**
 * Wrapper around fetch that includes credentials (cookies)
 * and handles JSON parsing + error extraction.
 */
export async function api<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: "include", // Send HttpOnly cookies
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || `API Error: ${res.status}`);
  }

  return data;
}
