import { apiClient } from "./client"
import type { LoginRequest, TokenResponse } from "./types"

export const authApi = {
  async login(credentials: LoginRequest): Promise<TokenResponse> {
    const response = await apiClient.post<TokenResponse>("/auth/login", credentials)
    apiClient.setToken(response.access_token)
    return response
  },

  async refresh(): Promise<TokenResponse> {
    const response = await apiClient.post<TokenResponse>("/auth/refresh")
    apiClient.setToken(response.access_token)
    return response
  },

  logout() {
    apiClient.clearToken()
  },

  getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token")
    }
    return null
  },
}
