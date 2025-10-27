export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  base = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000",
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${base}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || response.statusText);
  }

  return response.json() as Promise<T>;
}
