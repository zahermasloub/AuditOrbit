import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Middleware للتحكم في الوصول للصفحات حسب الأدوار
 * 
 * هذا الـ Middleware يعمل قبل كل طلب للتأكد من:
 * 1. وجود Token صالح
 * 2. صلاحية المستخدم للوصول للصفحة المطلوبة
 * 3. إعادة التوجيه للصفحة المناسبة حسب الدور
 */

// ============================================================================
// TYPES
// ============================================================================

type UserRole = "admin" | "manager" | "auditor"

interface DecodedToken {
  user_id: string
  email: string
  role: UserRole
  exp: number
}

// ============================================================================
// ROUTE PROTECTION RULES
// ============================================================================

/**
 * قواعد حماية المسارات حسب الأدوار
 */
const ROUTE_RULES: Record<string, UserRole[]> = {
  "/ops": ["admin"],                    // Ops فقط للـ Admin
  "/admin": ["admin"],                  // Admin Dashboard فقط للـ Admin
  "/manager": ["admin", "manager"],     // Manager يمكن للـ Admin الوصول إليه أيضاً
  "/auditor": ["admin", "manager", "auditor"], // Auditor يمكن للجميع الوصول إليه (للمراقبة)
}

// المسارات العامة التي لا تحتاج مصادقة
const PUBLIC_ROUTES = [
  "/login",
  "/",
  "/api/auth/login",
  "/api/auth/register",
  "/_next",
  "/favicon.ico",
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * فك تشفير JWT Token (بسيط)
 * ملاحظة: في الإنتاج، استخدم مكتبة مثل jose أو jsonwebtoken
 */
function decodeToken(token: string): DecodedToken | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null

    const payload = JSON.parse(
      Buffer.from(parts[1], "base64").toString("utf-8")
    )

    // التحقق من صلاحية Token
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null // Token منتهي الصلاحية
    }

    return payload as DecodedToken
  } catch {
    return null
  }
}

/**
 * فحص إذا كان المسار عام (لا يحتاج مصادقة)
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route))
}

/**
 * فحص صلاحية الوصول للمسار المطلوب
 */
function canAccessRoute(pathname: string, role: UserRole): boolean {
  // البحث عن قاعدة تطابق المسار
  for (const [routePattern, allowedRoles] of Object.entries(ROUTE_RULES)) {
    if (pathname.startsWith(routePattern)) {
      return allowedRoles.includes(role)
    }
  }

  // إذا لم توجد قاعدة محددة، السماح بالوصول
  return true
}

/**
 * الحصول على الصفحة الافتراضية حسب الدور
 */
function getDefaultRouteForRole(role: UserRole): string {
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

// ============================================================================
// MIDDLEWARE FUNCTION
// ============================================================================

export function middleware(request: NextRequest) {
  // 🔓 Disable all auth checks in development or when explicitly disabled
  const AUTH_DISABLED = process.env.NEXT_PUBLIC_DISABLE_AUTH === "1" || process.env.NODE_ENV !== "production"
  if (AUTH_DISABLED) {
    return NextResponse.next()
  }
  const { pathname } = request.nextUrl

  // السماح بالمسارات العامة
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  // الحصول على Token من Cookie
  const token = request.cookies.get("auth_token")?.value

  // إذا لم يوجد Token، إعادة التوجيه لصفحة تسجيل الدخول
  if (!token) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // فك تشفير Token
  const decodedToken = decodeToken(token)

  // إذا كان Token غير صالح، إعادة التوجيه لصفحة تسجيل الدخول
  if (!decodedToken) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    
    // حذف Token غير الصالح
    const response = NextResponse.redirect(loginUrl)
    response.cookies.delete("auth_token")
    
    return response
  }

  // فحص صلاحية الوصول
  const hasAccess = canAccessRoute(pathname, decodedToken.role)

  if (!hasAccess) {
    // إعادة التوجيه للصفحة الافتراضية حسب الدور
    const defaultRoute = getDefaultRouteForRole(decodedToken.role)
    
    // إذا كان المستخدم يحاول الوصول لـ /ops وليس admin
    if (pathname.startsWith("/ops")) {
      const unauthorizedUrl = new URL("/unauthorized", request.url)
      unauthorizedUrl.searchParams.set("message", "access_ops_denied")
      unauthorizedUrl.searchParams.set("role", decodedToken.role)
      return NextResponse.redirect(unauthorizedUrl)
    }

    return NextResponse.redirect(new URL(defaultRoute, request.url))
  }

  // إضافة Headers مخصصة للصفحة
  const response = NextResponse.next()
  response.headers.set("x-user-role", decodedToken.role)
  response.headers.set("x-user-id", decodedToken.user_id)

  return response
}

// ============================================================================
// MIDDLEWARE CONFIG
// ============================================================================

/**
 * تحديد المسارات التي يعمل عليها الـ Middleware
 */
export const config = {
  matcher: [
    /*
     * تطبيق Middleware على جميع المسارات ماعدا:
     * - api (غير المصادقة)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    // Exclude all API routes while auth is disabled to avoid interfering with API calls
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
