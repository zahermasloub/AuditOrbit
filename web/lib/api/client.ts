/**
 * API Client for AuditOrbit Backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
  timestamp: string
  detail?: string  // FastAPI unauthorized response
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
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Merge existing headers
    if (options.headers) {
      const existingHeaders = new Headers(options.headers)
      existingHeaders.forEach((value, key) => {
        headers[key] = value
      })
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const url = `${this.baseURL}${endpoint}`
    
    // Debug logging
    console.log('🔍 API Request:', {
      url,
      method: options.method || 'GET',
      hasToken: !!token,
      headers
    })
    
    const response = await fetch(url, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      const error = data as ApiError
      console.error('❌ API Error:', {
        url,
        status: response.status,
        statusText: response.statusText,
        error: data
      })
      
      // Handle unauthorized
      if (response.status === 401) {
        // Redirect to login if not authenticated
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          console.warn('Unauthorized - redirecting to login')
          window.location.href = '/login'
        }
        throw new Error('Unauthorized - please login')
      }
      
      throw new Error(error.error?.message || error.detail || 'Request failed')
    }

    return { data, status: response.status }
  }

  async get<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  async post<T>(endpoint: string, body?: unknown, options?: RequestInit) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  async put<T>(endpoint: string, body?: unknown, options?: RequestInit) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    })
  }

  async delete<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }
}

// Default client instance
export const apiClient = new ApiClient(API_BASE_URL, () => {
  if (typeof window !== 'undefined') {
    // Try both keys for compatibility
    return localStorage.getItem('auth_token') || localStorage.getItem('access_token')
  }
  return null
})
