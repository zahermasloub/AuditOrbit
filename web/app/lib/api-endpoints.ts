/**
 * دوال API Endpoints - موحدة وآمنة
 * جميع الاستدعاءات للـ Backend من هنا
 */

import { apiClient, safeApiCall, type ApiResponse } from './api-client'

// ================================
// Authentication APIs
// ================================

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  token_type: string
  user: {
    id: number
    email: string
    full_name: string
    role: string
  }
}

export async function login(credentials: LoginCredentials) {
  return safeApiCall<LoginResponse>(
    apiClient.POST('/api/auth/login', {
      body: credentials,
    })
  )
}

export async function logout() {
  return safeApiCall<{ message: string }>(
    apiClient.POST('/api/auth/logout', {})
  )
}

export async function getCurrentUser() {
  return safeApiCall<LoginResponse['user']>(
    apiClient.GET('/api/auth/me', {})
  )
}

// ================================
// Users APIs
// ================================

export interface User {
  id: number
  email: string
  full_name: string
  role: string
  is_active: boolean
  created_at: string
}

export interface CreateUserInput {
  email: string
  full_name: string
  password: string
  role: string
}

export interface UpdateUserInput {
  email?: string
  full_name?: string
  role?: string
  is_active?: boolean
}

export async function getUsers(page: number = 1, page_size: number = 20) {
  return safeApiCall<User[]>(
    apiClient.GET('/api/users/', {
      params: {
        query: { page, page_size },
      },
    })
  )
}

export async function getUser(id: number) {
  return safeApiCall<User>(
    apiClient.GET('/api/users/{id}', {
      params: {
        path: { id },
      },
    })
  )
}

export async function createUser(user: CreateUserInput) {
  return safeApiCall<User>(
    apiClient.POST('/api/users/', {
      body: user,
    })
  )
}

export async function updateUser(id: number, user: UpdateUserInput) {
  return safeApiCall<User>(
    apiClient.PUT('/api/users/{id}', {
      params: {
        path: { id },
      },
      body: user,
    })
  )
}

export async function deleteUser(id: number) {
  return safeApiCall<{ message: string }>(
    apiClient.DELETE('/api/users/{id}', {
      params: {
        path: { id },
      },
    })
  )
}

// ================================
// Engagements APIs
// ================================

export interface Engagement {
  id: number
  title: string
  description: string
  status: 'planning' | 'in_progress' | 'completed' | 'archived'
  start_date: string
  end_date: string
  manager_id: number
  created_at: string
}

export interface CreateEngagementInput {
  title: string
  description: string
  start_date: string
  end_date: string
  manager_id: number
}

export async function getEngagements(
  page: number = 1,
  page_size: number = 20,
  status?: string
) {
  return safeApiCall<Engagement[]>(
    apiClient.GET('/api/engagements/', {
      params: {
        query: { page, page_size, status },
      },
    })
  )
}

export async function getEngagement(id: number) {
  return safeApiCall<Engagement>(
    apiClient.GET('/api/engagements/{id}', {
      params: {
        path: { id },
      },
    })
  )
}

export async function createEngagement(engagement: CreateEngagementInput) {
  return safeApiCall<Engagement>(
    apiClient.POST('/api/engagements/', {
      body: engagement,
    })
  )
}

export async function updateEngagement(id: number, engagement: Partial<CreateEngagementInput>) {
  return safeApiCall<Engagement>(
    apiClient.PUT('/api/engagements/{id}', {
      params: {
        path: { id },
      },
      body: engagement,
    })
  )
}

// ================================
// Findings APIs
// ================================

export interface Finding {
  id: number
  engagement_id: number
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  created_at: string
}

export async function getFindings(engagement_id: number) {
  return safeApiCall<Finding[]>(
    apiClient.GET('/api/findings/', {
      params: {
        query: { engagement_id },
      },
    })
  )
}

export async function createFinding(finding: Omit<Finding, 'id' | 'created_at'>) {
  return safeApiCall<Finding>(
    apiClient.POST('/api/findings/', {
      body: finding,
    })
  )
}

// ================================
// Dashboard / Analytics APIs
// ================================

export interface DashboardStats {
  total_engagements: number
  active_engagements: number
  total_findings: number
  critical_findings: number
  completion_rate: number
}

export async function getDashboardStats(role: string) {
  return safeApiCall<DashboardStats>(
    apiClient.GET('/api/dashboard/stats', {
      params: {
        query: { role },
      },
    })
  )
}

// ================================
// React Query Hooks (اختياري)
// ================================

// يمكنك استخدام هذه مع @tanstack/react-query

export const queryKeys = {
  users: ['users'] as const,
  user: (id: number) => ['users', id] as const,
  engagements: ['engagements'] as const,
  engagement: (id: number) => ['engagements', id] as const,
  findings: (engagementId: number) => ['findings', engagementId] as const,
  dashboardStats: (role: string) => ['dashboard', 'stats', role] as const,
  currentUser: ['auth', 'me'] as const,
}

// مثال على Hook مخصص
export function useApiQuery<T>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<{ data: T | null; error: any }>
) {
  // استخدم useQuery من @tanstack/react-query هنا
  // return useQuery({ queryKey, queryFn })
}
