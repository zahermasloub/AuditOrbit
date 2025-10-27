/**
 * عميل API موحد - Unified API Client
 * يتعامل مع جميع استدعاءات Backend
 */

import createClient from 'openapi-fetch'
import type { paths } from './types.gen'

// تكوين عنوان Backend
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

// إنشاء العميل الآمن
export const apiClient = createClient<paths>({
  baseUrl: BACKEND_URL,
})

// نوع الاستجابة الموحدة
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
  count?: number
  message?: string
  timestamp: string
}

// أكواد الأخطاء
export const ErrorCodes = {
  // Authentication & Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_FIELD: 'MISSING_FIELD',
  
  // Resources
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',
  
  // Business Logic
  OPERATION_FAILED: 'OPERATION_FAILED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  INVALID_STATE: 'INVALID_STATE',
  
  // Server
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR: 'DATABASE_ERROR',
} as const

// معالج الأخطاء
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

// دالة مساعدة للاستدعاءات الآمنة
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

// معالج التوكن
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

  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.exp * 1000 < Date.now()
    } catch {
      return true
    }
  }
}

// Interceptor للتوكن التلقائي
apiClient.use({
  onRequest: async ({ request }) => {
    const token = TokenManager.getToken()
    if (token && !TokenManager.isTokenExpired(token)) {
      request.headers.set('Authorization', `Bearer ${token}`)
    }
    return request
  },
  onResponse: async ({ response }) => {
    // إذا كان التوكن منتهي، حاول التحديث
    if (response.status === 401) {
      const refreshToken = TokenManager.getRefreshToken()
      if (refreshToken) {
        // TODO: استدعاء endpoint تحديث التوكن
        // const newToken = await refreshAccessToken(refreshToken)
        // TokenManager.setToken(newToken)
      } else {
        TokenManager.clearTokens()
        // إعادة التوجيه لصفحة تسجيل الدخول
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/sign-in'
        }
      }
    }
    return response
  },
})

export default apiClient
