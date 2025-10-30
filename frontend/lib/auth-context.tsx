"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

/**
 * نظام المصادقة والصلاحيات - Auth & Authorization System
 * 
 * هذا الملف يوفر:
 * - Context API لإدارة بيانات المستخدم الحالي
 * - إدارة الأدوار (Admin, Manager, Auditor)
 * - فحص الصلاحيات على مستوى الصفحات والمكونات
 * - إدارة Token وتسجيل الدخول/الخروج
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * الأدوار المتاحة في النظام
 */
export type UserRole = "admin" | "manager" | "auditor"

/**
 * صلاحيات الوصول لنظام Ops
 */
export interface OpsPermissions {
  canAccess: boolean          // وصول أساسي للقراءة
  canEditSettings: boolean    // تعديل الإعدادات
  canManageStorage: boolean   // إدارة التخزين (CRUD)
  canViewLogs: boolean        // عرض السجلات
  canManageAI: boolean        // إدارة مهام AI
}

/**
 * صلاحيات الوصول لصفحة Admin
 */
export interface AdminPermissions {
  canAccess: boolean
  canManageUsers: boolean
  canManageRoles: boolean
  canViewAuditLogs: boolean
}

/**
 * صلاحيات الوصول لصفحة Manager
 */
export interface ManagerPermissions {
  canAccess: boolean
  canCreateEngagements: boolean
  canAssignTasks: boolean
  canApproveReports: boolean
  canManageFindings: boolean
}

/**
 * صلاحيات الوصول لصفحة Auditor
 */
export interface AuditorPermissions {
  canAccess: boolean
  canExecuteTasks: boolean
  canUseAITools: boolean
  canGenerateReports: boolean
}

/**
 * بيانات المستخدم الكاملة
 */
export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  department?: string
  permissions: {
    ops: OpsPermissions
    admin: AdminPermissions
    manager: ManagerPermissions
    auditor: AuditorPermissions
  }
}

/**
 * حالة المصادقة
 */
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

/**
 * واجهة Context
 */
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
  hasPermission: (resource: string, action: string) => boolean
  canAccessRoute: (path: string) => boolean
}

// ============================================================================
// PERMISSIONS MATRIX - مصفوفة الصلاحيات
// ============================================================================

/**
 * تحديد الصلاحيات لكل دور
 */
const ROLE_PERMISSIONS: Record<UserRole, User["permissions"]> = {
  admin: {
    ops: {
      canAccess: true,
      canEditSettings: true,
      canManageStorage: true,
      canViewLogs: true,
      canManageAI: true,
    },
    admin: {
      canAccess: true,
      canManageUsers: true,
      canManageRoles: true,
      canViewAuditLogs: true,
    },
    manager: {
      canAccess: true,
      canCreateEngagements: true,
      canAssignTasks: true,
      canApproveReports: true,
      canManageFindings: true,
    },
    auditor: {
      canAccess: true,
      canExecuteTasks: true,
      canUseAITools: true,
      canGenerateReports: true,
    },
  },
  manager: {
    ops: {
      canAccess: true,          // قراءة فقط
      canEditSettings: false,
      canManageStorage: false,
      canViewLogs: true,        // عرض السجلات المتعلقة بالمهام
      canManageAI: false,
    },
    admin: {
      canAccess: false,
      canManageUsers: false,
      canManageRoles: false,
      canViewAuditLogs: false,
    },
    manager: {
      canAccess: true,
      canCreateEngagements: true,
      canAssignTasks: true,
      canApproveReports: true,
      canManageFindings: true,
    },
    auditor: {
      canAccess: true,          // عرض فقط
      canExecuteTasks: false,
      canUseAITools: false,
      canGenerateReports: false,
    },
  },
  auditor: {
    ops: {
      canAccess: false,
      canEditSettings: false,
      canManageStorage: false,
      canViewLogs: false,
      canManageAI: false,
    },
    admin: {
      canAccess: false,
      canManageUsers: false,
      canManageRoles: false,
      canViewAuditLogs: false,
    },
    manager: {
      canAccess: false,
      canCreateEngagements: false,
      canAssignTasks: false,
      canApproveReports: false,
      canManageFindings: false,
    },
    auditor: {
      canAccess: true,
      canExecuteTasks: true,
      canUseAITools: true,
      canGenerateReports: true,
    },
  },
}

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  })
  const router = useRouter()

  /**
   * تحميل بيانات المستخدم من Token عند بدء التطبيق
   */
  useEffect(() => {
    const initAuth = async () => {
      try {
        // محاولة قراءة Token من localStorage
        const token = localStorage.getItem("auth_token")
        if (!token) {
          setAuthState({ user: null, isAuthenticated: false, isLoading: false })
          return
        }

        // جلب بيانات المستخدم من API
        const response = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) {
          throw new Error("Invalid token")
        }

        const userData = await response.json()
        const user = createUserFromResponse(userData)

        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        })
      } catch (error) {
        console.error("Auth initialization error:", error)
        localStorage.removeItem("auth_token")
        setAuthState({ user: null, isAuthenticated: false, isLoading: false })
      }
    }

    initAuth()
  }, [])

  /**
   * تسجيل الدخول
   */
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || "Login failed")
      }

      const data = await response.json()
      localStorage.setItem("auth_token", data.access_token)
      if (data.refresh_token) {
        localStorage.setItem("refresh_token", data.refresh_token)
      }

      const user = createUserFromResponse(data.user)
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      })

      // إعادة توجيه حسب الدور
      redirectAfterLogin(user.role)
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  /**
   * تسجيل الخروج
   */
  const logout = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("refresh_token")
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    })
    router.push("/login")
  }

  /**
   * تحديث بيانات المستخدم
   */
  const refreshUser = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) throw new Error("No token")

      const response = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error("Failed to refresh user")

      const userData = await response.json()
      const user = createUserFromResponse(userData)

      setAuthState((prev) => ({ ...prev, user }))
    } catch (error) {
      console.error("Refresh user error:", error)
      logout()
    }
  }

  /**
   * فحص صلاحية معينة
   */
  const hasPermission = (resource: string, action: string): boolean => {
    if (!authState.user) return false

    const permissions = authState.user.permissions
    
    // مثال: hasPermission("ops", "editSettings")
    switch (resource) {
      case "ops":
        return permissions.ops.canEditSettings && action === "editSettings"
          || permissions.ops.canManageStorage && action === "manageStorage"
          || permissions.ops.canViewLogs && action === "viewLogs"
          || permissions.ops.canManageAI && action === "manageAI"
          || permissions.ops.canAccess && action === "access"
      case "admin":
        return permissions.admin.canAccess && action === "access"
          || permissions.admin.canManageUsers && action === "manageUsers"
          || permissions.admin.canManageRoles && action === "manageRoles"
      case "manager":
        return permissions.manager.canAccess && action === "access"
          || permissions.manager.canCreateEngagements && action === "createEngagements"
      case "auditor":
        return permissions.auditor.canAccess && action === "access"
          || permissions.auditor.canExecuteTasks && action === "executeTasks"
      default:
        return false
    }
  }

  /**
   * فحص إمكانية الوصول لمسار معين
   */
  const canAccessRoute = (path: string): boolean => {
    if (!authState.user) return false

    const { permissions } = authState.user

    if (path.startsWith("/ops")) return permissions.ops.canAccess
    if (path.startsWith("/admin")) return permissions.admin.canAccess
    if (path.startsWith("/manager")) return permissions.manager.canAccess
    if (path.startsWith("/auditor")) return permissions.auditor.canAccess
    
    // المسارات العامة
    return true
  }

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        refreshUser,
        hasPermission,
        canAccessRoute,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ============================================================================
// CUSTOM HOOK
// ============================================================================

/**
 * Hook للوصول لـ Auth Context
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * إنشاء كائن User من استجابة API
 */
function createUserFromResponse(data: any): User {
  const role = (data.role?.toLowerCase() || "auditor") as UserRole
  
  return {
    id: data.id || data.user_id || "1",
    name: data.name || data.full_name || "مستخدم",
    email: data.email || "",
    role,
    avatar: data.avatar,
    department: data.department,
    permissions: ROLE_PERMISSIONS[role],
  }
}

/**
 * إعادة التوجيه بعد تسجيل الدخول حسب الدور
 */
function redirectAfterLogin(role: UserRole) {
  switch (role) {
    case "admin":
      window.location.href = "/admin"
      break
    case "manager":
      window.location.href = "/manager"
      break
    case "auditor":
      window.location.href = "/auditor"
      break
    default:
      window.location.href = "/dashboard"
  }
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook للتحقق من صلاحية Ops
 */
export function useOpsPermissions() {
  const { user } = useAuth()
  return user?.permissions.ops || {
    canAccess: false,
    canEditSettings: false,
    canManageStorage: false,
    canViewLogs: false,
    canManageAI: false,
  }
}

/**
 * Hook للتحقق من دور المستخدم
 */
export function useUserRole(): UserRole | null {
  const { user } = useAuth()
  return user?.role || null
}

/**
 * Hook للتحقق من صلاحية Admin
 */
export function useIsAdmin(): boolean {
  const { user } = useAuth()
  return user?.role === "admin"
}

/**
 * Hook للتحقق من صلاحية Manager
 */
export function useIsManager(): boolean {
  const { user } = useAuth()
  return user?.role === "manager"
}

/**
 * Hook للتحقق من صلاحية Auditor
 */
export function useIsAuditor(): boolean {
  const { user } = useAuth()
  return user?.role === "auditor"
}
