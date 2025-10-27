/**
 * عميل API موحد - للتواصل مع Backend
 */

import createClient from 'openapi-fetch'
import type { paths } from './types.gen'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

export const apiClient = createClient<paths>({
  baseUrl: BACKEND_URL,
})

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  pagination?: {
    page: number
    page_size: number
    total_items: number
    total_pages: number
  }
  message?: string
  timestamp: string
}

export const ErrorCodes = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const

export class ApiError extends Error {
  code: string
  details?: any
  statusCode?: number

  constructor(code: string, message: string, details?: any, statusCode?: number) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.details = details
    this.statusCode = statusCode
  }
}

export async function safeApiCall<T>(
  promise: Promise<any>
): Promise<{ data: T | null; error: ApiError | null }> {
  try {
    const response = await promise

    if (response.error) {
      const errorData = response.error as any
      return {
        data: null,
        error: new ApiError(
          errorData.error?.code || ErrorCodes.INTERNAL_ERROR,
          errorData.error?.message || 'حدث خطأ غير متوقع',
          errorData.error?.details,
          response.response?.status
        ),
      }
    }

    const apiResponse = response.data as ApiResponse<T>

    if (!apiResponse.success) {
      return {
        data: null,
        error: new ApiError(
          apiResponse.error?.code || ErrorCodes.INTERNAL_ERROR,
          apiResponse.error?.message || 'حدث خطأ غير متوقع',
          apiResponse.error?.details,
          response.response?.status
        ),
      }
    }

    return { data: apiResponse.data || null, error: null }
  } catch (err) {
    return {
      data: null,
      error: new ApiError(
        ErrorCodes.INTERNAL_ERROR,
        err instanceof Error ? err.message : 'حدث خطأ غير متوقع'
      ),
    }
  }
}

export class TokenManager {
  private static readonly TOKEN_KEY = 'auth_token'
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token'

  static getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(this.TOKEN_KEY)
  }

  static setToken(token: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.TOKEN_KEY, token)
  }

  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(this.REFRESH_TOKEN_KEY)
  }

  static setRefreshToken(token: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token)
  }

  static clearTokens(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(this.TOKEN_KEY)
    localStorage.removeItem(this.REFRESH_TOKEN_KEY)
  }
}

apiClient.use({
  onRequest: async ({ request }) => {
    const token = TokenManager.getToken()
    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`)
    }
    return request
  },
  onResponse: async ({ response }) => {
    if (response.status === 401) {
      TokenManager.clearTokens()
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
    return response
  },
})

export default apiClient
