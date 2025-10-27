/**
 * API Client for AuditOrbit Backend
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "http://localhost:8000"

interface ApiError {
  success: false
  error?: {
    code?: string
    message?: string
    details?: Record<string, unknown>
  }
  timestamp?: string
  detail?: string
}

export class ApiClient {
  private baseURL: string
  private getToken: () => string | null

  constructor(baseURL: string, getToken: () => string | null) {
    this.baseURL = baseURL
    this.getToken = getToken
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data: T; status: number }> {
    const token = this.getToken()
    const headers = new Headers(options.headers)

    if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json")
    }

    if (token) {
      headers.set("Authorization", `Bearer ${token}`)
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    })

    const contentType = response.headers.get("content-type") ?? ""
    let data: unknown = null

    if (response.status !== 204) {
      if (contentType.includes("application/json")) {
        data = await response.json()
      } else if (contentType.startsWith("text/")) {
        data = await response.text()
      } else {
        data = await response.blob()
      }
    }

    if (!response.ok) {
      if (
        response.status === 401 &&
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/login")
      ) {
        window.location.href = "/login"
      }

      const error = data as ApiError | string | null
      const message =
        typeof error === "string"
          ? error
          : error?.error?.message || error?.detail || response.statusText || "Request failed"

      throw new Error(message)
    }

    return { data: data as T, status: response.status }
  }

  async get<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: "GET" })
  }

  async post<T>(endpoint: string, body?: unknown, options?: RequestInit) {
    const requestBody =
      body instanceof FormData || typeof body === "string"
        ? body
        : body == null
          ? undefined
          : JSON.stringify(body)

    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: requestBody as BodyInit | undefined,
    })
  }

  async put<T>(endpoint: string, body?: unknown, options?: RequestInit) {
    const requestBody =
      body instanceof FormData || typeof body === "string"
        ? body
        : body == null
          ? undefined
          : JSON.stringify(body)

    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: requestBody as BodyInit | undefined,
    })
  }

  async delete<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: "DELETE" })
  }
}

// Default client instance
export const apiClient = new ApiClient(API_BASE_URL, () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token") || localStorage.getItem("access_token")
  }
  return null
})
