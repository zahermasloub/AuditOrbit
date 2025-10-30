"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Loader2 } from "lucide-react"

/**
 * Higher-Order Component (HOC) لحماية الصفحات
 * 
 * الاستخدام:
 * export default withAuth(MyPage, { allowedRoles: ["admin"] })
 */

interface WithAuthOptions {
  allowedRoles?: Array<"admin" | "manager" | "auditor">
  redirectTo?: string
  showLoading?: boolean
}

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const {
    allowedRoles,
    redirectTo = "/login",
    showLoading = true,
  } = options

  return function ProtectedComponent(props: P) {
    const { user, isAuthenticated, isLoading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const [shouldRender, setShouldRender] = useState(false)

    useEffect(() => {
      // إذا كان التحميل مستمر، انتظر
      if (isLoading) {
        return
      }

      // إذا لم يكن مصادقاً، إعادة التوجيه لصفحة تسجيل الدخول
      if (!isAuthenticated || !user) {
        const loginUrl = `${redirectTo}?redirect=${encodeURIComponent(pathname)}`
        router.push(loginUrl)
        return
      }

      // إذا كانت هناك أدوار محددة، فحص صلاحية المستخدم
      if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(user.role)) {
          // إعادة التوجيه للصفحة الافتراضية حسب الدور
          const defaultRoute = getDefaultRouteForRole(user.role)
          router.push(defaultRoute)
          return
        }
      }

      // السماح بالعرض
      setShouldRender(true)
    }, [isLoading, isAuthenticated, user, router, pathname])

    // عرض شاشة التحميل
    if (isLoading || !shouldRender) {
      if (!showLoading) return null

      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 text-indigo-500 animate-spin mx-auto" />
            <p className="text-slate-300 text-lg">جاري التحميل...</p>
          </div>
        </div>
      )
    }

    return <Component {...props} />
  }
}

/**
 * مكون لحماية محتوى معين حسب الصلاحيات
 */
interface ProtectedProps {
  children: React.ReactNode
  allowedRoles?: Array<"admin" | "manager" | "auditor">
  fallback?: React.ReactNode
  resource?: string
  action?: string
}

export function Protected({
  children,
  allowedRoles,
  fallback = null,
  resource,
  action,
}: ProtectedProps) {
  const { user, hasPermission } = useAuth()

  // فحص حسب الأدوار
  if (allowedRoles && allowedRoles.length > 0) {
    if (!user || !allowedRoles.includes(user.role)) {
      return <>{fallback}</>
    }
  }

  // فحص حسب الصلاحيات المحددة
  if (resource && action) {
    if (!hasPermission(resource, action)) {
      return <>{fallback}</>
    }
  }

  return <>{children}</>
}

/**
 * Hook لفحص إذا كان المستخدم لديه صلاحية
 */
export function useHasRole(role: "admin" | "manager" | "auditor"): boolean {
  const { user } = useAuth()
  return user?.role === role
}

/**
 * Hook لفحص إذا كان المستخدم لديه أحد الأدوار
 */
export function useHasAnyRole(roles: Array<"admin" | "manager" | "auditor">): boolean {
  const { user } = useAuth()
  return user ? roles.includes(user.role) : false
}

/**
 * Helper function للحصول على المسار الافتراضي حسب الدور
 */
function getDefaultRouteForRole(role: "admin" | "manager" | "auditor"): string {
  switch (role) {
    case "admin":
      return "/admin"
    case "manager":
      return "/manager"
    case "auditor":
      return "/auditor"
    default:
      return "/dashboard"
  }
}
