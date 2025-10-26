export const API_BASE_URL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_BACKEND_URL) ||
  process.env.BACKEND_URL ||
  "http://localhost:8000";
