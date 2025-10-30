"use client"

import { useAuth, useOpsPermissions, useUserRole } from "@/lib/auth-context"
import { Shield, Lock, Eye, EyeOff, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

/**
 * مكونات UI تتغير حسب دور المستخدم
 */

// ============================================================================
// ROLE BADGE - شارة الدور
// ============================================================================

export function RoleBadge({ className }: { className?: string }) {
  const role = useUserRole()

  if (!role) return null

  const roleConfig = {
    admin: {
      label: "مدير النظام",
      color: "bg-red-500/20 text-red-300 border-red-500/30",
      icon: Shield,
    },
    manager: {
      label: "مدير التدقيق",
      color: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      icon: Shield,
    },
    auditor: {
      label: "مدقق",
      color: "bg-green-500/20 text-green-300 border-green-500/30",
      icon: Shield,
    },
  }

  const config = roleConfig[role]
  const Icon = config.icon

  return (
    <Badge variant="outline" className={`${config.color} ${className}`}>
      <Icon className="h-3 w-3 ml-1" />
      {config.label}
    </Badge>
  )
}

// ============================================================================
// READ-ONLY BANNER - شريط القراءة فقط
// ============================================================================

interface ReadOnlyBannerProps {
  show?: boolean
  message?: string
  className?: string
}

export function ReadOnlyBanner({
  show = true,
  message = "🔒 أنت في وضع القراءة فقط. لتعديل البيانات، اتصل بمدير النظام.",
  className = "",
}: ReadOnlyBannerProps) {
  const role = useUserRole()

  if (!show || role === "admin") return null

  return (
    <Alert className={`bg-yellow-500/10 border-yellow-500/30 ${className}`}>
      <Lock className="h-4 w-4 text-yellow-400" />
      <AlertDescription className="text-yellow-300 text-sm">
        {message}
      </AlertDescription>
    </Alert>
  )
}

// ============================================================================
// OPS ACCESS BANNER - شريط إعلام في /ops
// ============================================================================

interface OpsAccessBannerProps {
  className?: string
}

export function OpsAccessBanner({ className }: OpsAccessBannerProps = {}) {
  const role = useUserRole()
  const opsPermissions = useOpsPermissions()

  // Admin لا يحتاج banner
  if (role === "admin") return null

  // Manager - قراءة فقط
  if (role === "manager" && opsPermissions.canAccess) {
    return (
      <Alert className={`bg-blue-500/10 border-blue-500/30 ${className || ""}`}>
        <Eye className="h-4 w-4 text-blue-400" />
        <AlertDescription className="text-blue-300 text-sm">
          <strong>وضع المراقبة:</strong> يمكنك عرض حالة النظام والسجلات فقط. جميع
          عمليات التعديل محظورة.
        </AlertDescription>
      </Alert>
    )
  }

  // Auditor - لا وصول
  if (role === "auditor") {
    return (
      <Alert className={`bg-red-500/10 border-red-500/30 ${className || ""}`}>
        <EyeOff className="h-4 w-4 text-red-400" />
        <AlertDescription className="text-red-300 text-sm">
          <strong>وصول محظور:</strong> هذه الصفحة مخصصة لمديري النظام فقط. يرجى
          العودة إلى صفحة المدقق.
        </AlertDescription>
      </Alert>
    )
  }

  return null
}

// ============================================================================
// PERMISSION GATE - بوابة الصلاحيات
// ============================================================================

interface PermissionGateProps {
  children: React.ReactNode
  resource: string
  action: string
  fallback?: React.ReactNode
  showMessage?: boolean
}

export function PermissionGate({
  children,
  resource,
  action,
  fallback,
  showMessage = false,
}: PermissionGateProps) {
  const { hasPermission } = useAuth()

  if (!hasPermission(resource, action)) {
    if (showMessage) {
      return (
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg text-center">
          <Lock className="h-8 w-8 text-slate-500 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">
            ليس لديك صلاحية لهذه العملية
          </p>
        </div>
      )
    }

    return <>{fallback}</>
  }

  return <>{children}</>
}

// ============================================================================
// ACTION BUTTON WITH PERMISSION - زر مع فحص الصلاحية
// ============================================================================

interface ActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  resource?: string
  action?: string
  requireAdmin?: boolean
  children: React.ReactNode
}

export function ActionButton({
  resource,
  action,
  requireAdmin = false,
  children,
  disabled,
  ...props
}: ActionButtonProps) {
  const { hasPermission, user } = useAuth()

  // فحص Admin
  if (requireAdmin && user?.role !== "admin") {
    return (
      <button
        {...props}
        disabled={true}
        className={`${props.className} opacity-50 cursor-not-allowed`}
        title="هذا الإجراء يتطلب صلاحيات مدير النظام"
      >
        {children}
        <Lock className="h-4 w-4 mr-2" />
      </button>
    )
  }

  // فحص الصلاحية المحددة
  if (resource && action) {
    const hasAccess = hasPermission(resource, action)
    return (
      <button
        {...props}
        disabled={disabled || !hasAccess}
        className={`${props.className} ${!hasAccess ? "opacity-50 cursor-not-allowed" : ""}`}
        title={!hasAccess ? "ليس لديك صلاحية لهذا الإجراء" : ""}
      >
        {children}
        {!hasAccess && <Lock className="h-4 w-4 mr-2" />}
      </button>
    )
  }

  return (
    <button {...props} disabled={disabled}>
      {children}
    </button>
  )
}

// ============================================================================
// ROLE-SPECIFIC CONTENT - محتوى حسب الدور
// ============================================================================

interface RoleContentProps {
  admin?: React.ReactNode
  manager?: React.ReactNode
  auditor?: React.ReactNode
  fallback?: React.ReactNode
}

export function RoleContent({
  admin,
  manager,
  auditor,
  fallback = null,
}: RoleContentProps) {
  const role = useUserRole()

  switch (role) {
    case "admin":
      return <>{admin}</>
    case "manager":
      return <>{manager}</>
    case "auditor":
      return <>{auditor}</>
    default:
      return <>{fallback}</>
  }
}

// ============================================================================
// FEATURE FLAG - علامة الميزة
// ============================================================================

interface FeatureFlagProps {
  children: React.ReactNode
  feature: string
  fallback?: React.ReactNode
}

export function FeatureFlag({
  children,
  feature: _feature,
  fallback = null,
}: FeatureFlagProps) {
  const { user } = useAuth()

  // يمكن توسيع هذا لاحقاً بنظام feature flags
  // حالياً: جميع الميزات متاحة للـ admin
  if (user?.role === "admin") {
    return <>{children}</>
  }

  return <>{fallback}</>
}

// ============================================================================
// SENSITIVE DATA - بيانات حساسة
// ============================================================================

interface SensitiveDataProps {
  children: React.ReactNode
  allowedRoles?: Array<"admin" | "manager" | "auditor">
  masked?: boolean
  maskText?: string
}

export function SensitiveData({
  children,
  allowedRoles = ["admin"],
  masked = true,
  maskText = "••••••••",
}: SensitiveDataProps) {
  const role = useUserRole()

  if (!role || !allowedRoles.includes(role)) {
    return <span className="text-slate-500">{masked ? maskText : null}</span>
  }

  return <>{children}</>
}

// ============================================================================
// NO PERMISSION MESSAGE - رسالة عدم الصلاحية
// ============================================================================

export function NoPermissionMessage({
  resource,
  message,
}: {
  resource?: string
  message?: string
}) {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center space-y-4 max-w-md">
        <div className="inline-flex p-4 bg-red-500/10 border border-red-500/30 rounded-full">
          <AlertCircle className="h-12 w-12 text-red-400" />
        </div>
        <h3 className="text-2xl font-bold text-white">وصول محظور</h3>
        <p className="text-slate-400">
          {message || `ليس لديك صلاحية للوصول إلى ${resource || "هذه الصفحة"}.`}
        </p>
        <p className="text-sm text-slate-500">
          إذا كنت تعتقد أن هذا خطأ، يرجى الاتصال بمدير النظام.
        </p>
      </div>
    </div>
  )
}
