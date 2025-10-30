"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, ChevronLeft } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

// ============================================================================
// ROUTE LABELS - تسميات المسارات بالعربية والإنجليزية
// ============================================================================

const ROUTE_LABELS: Record<string, { ar: string; en: string }> = {
  // Root
  dashboard: { ar: "لوحة التحكم", en: "Dashboard" },

  // Admin
  admin: { ar: "الإدارة", en: "Admin" },
  users: { ar: "المستخدمون", en: "Users" },
  settings: { ar: "الإعدادات", en: "Settings" },

  // Manager
  manager: { ar: "المدير", en: "Manager" },
  engagements: { ar: "المهام", en: "Engagements" },
  findings: { ar: "النتائج", en: "Findings" },
  reports: { ar: "التقارير", en: "Reports" },

  // Auditor
  auditor: { ar: "المدقق", en: "Auditor" },
  "my-engagements": { ar: "مهامي", en: "My Engagements" },
  evidence: { ar: "الأدلة", en: "Evidence" },
  workpapers: { ar: "أوراق العمل", en: "Workpapers" },

  // Ops
  ops: { ar: "العمليات", en: "Operations" },
  api: { ar: "مستكشف API", en: "API Explorer" },
  storage: { ar: "التخزين", en: "Storage" },
  ai: { ar: "مهام AI", en: "AI Tasks" },
  logs: { ar: "السجلات", en: "Logs" },

  // Common
  new: { ar: "جديد", en: "New" },
  edit: { ar: "تعديل", en: "Edit" },
  view: { ar: "عرض", en: "View" },
}

// ============================================================================
// BREADCRUMB GENERATOR - توليد Breadcrumbs من المسار
// ============================================================================

interface BreadcrumbSegment {
  label: string
  href: string
  isLast: boolean
}

function generateBreadcrumbs(pathname: string): BreadcrumbSegment[] {
  // تنظيف المسار
  const segments = pathname.split("/").filter(Boolean)

  // إذا كنا في الصفحة الرئيسية
  if (segments.length === 0) {
    return [{ label: "لوحة التحكم", href: "/dashboard", isLast: true }]
  }

  const breadcrumbs: BreadcrumbSegment[] = []
  let currentPath = ""

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`
    const isLast = index === segments.length - 1

    // تحويل الـ IDs (أرقام أو UUIDs) إلى تسميات أفضل
    let label = segment
    if (/^[0-9a-f-]{36}$/i.test(segment)) {
      // UUID
      label = `${ROUTE_LABELS[segments[index - 1]]?.ar || "عنصر"} #${segment.slice(0, 8)}`
    } else if (/^\d+$/.test(segment)) {
      // رقم
      label = `${ROUTE_LABELS[segments[index - 1]]?.ar || "عنصر"} #${segment}`
    } else {
      // استخدام التسمية المعرفة
      const routeLabel = ROUTE_LABELS[segment]
      label = routeLabel ? `${routeLabel.ar} / ${routeLabel.en}` : segment
    }

    breadcrumbs.push({
      label,
      href: currentPath,
      isLast,
    })
  })

  return breadcrumbs
}

// ============================================================================
// DYNAMIC BREADCRUMBS COMPONENT
// ============================================================================

interface DynamicBreadcrumbsProps {
  className?: string
  showHome?: boolean
}

export function DynamicBreadcrumbs({
  className = "",
  showHome = true,
}: DynamicBreadcrumbsProps) {
  const pathname = usePathname()
  const breadcrumbs = generateBreadcrumbs(pathname)

  // لا تعرض breadcrumbs في الصفحة الرئيسية أو صفحة تسجيل الدخول
  if (pathname === "/" || pathname === "/login" || pathname === "/dashboard") {
    return null
  }

  return (
    <div className={`mb-6 ${className}`}>
      <Breadcrumb>
        <BreadcrumbList className="text-slate-300">
          {showHome && (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 hover:text-indigo-400 transition-colors"
                  >
                    <Home className="h-4 w-4" />
                    <span>الرئيسية</span>
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronLeft className="h-4 w-4 text-slate-500" />
              </BreadcrumbSeparator>
            </>
          )}

          {breadcrumbs.map((crumb, index) => (
            <BreadcrumbItem key={crumb.href}>
              {crumb.isLast ? (
                <BreadcrumbPage className="text-indigo-300 font-medium">
                  {crumb.label}
                </BreadcrumbPage>
              ) : (
                <>
                  <BreadcrumbLink asChild>
                    <Link
                      href={crumb.href}
                      className="hover:text-indigo-400 transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  </BreadcrumbLink>
                  {index < breadcrumbs.length - 1 && (
                    <BreadcrumbSeparator>
                      <ChevronLeft className="h-4 w-4 text-slate-500" />
                    </BreadcrumbSeparator>
                  )}
                </>
              )}
            </BreadcrumbItem>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}

// ============================================================================
// CUSTOM BREADCRUMBS - لاستخدام يدوي
// ============================================================================

interface CustomBreadcrumb {
  label: string
  href?: string
}

interface CustomBreadcrumbsProps {
  items: CustomBreadcrumb[]
  className?: string
}

export function CustomBreadcrumbs({
  items,
  className = "",
}: CustomBreadcrumbsProps) {
  return (
    <div className={`mb-6 ${className}`}>
      <Breadcrumb>
        <BreadcrumbList className="text-slate-300">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 hover:text-indigo-400 transition-colors"
              >
                <Home className="h-4 w-4" />
                <span>الرئيسية</span>
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronLeft className="h-4 w-4 text-slate-500" />
          </BreadcrumbSeparator>

          {items.map((item, index) => {
            const isLast = index === items.length - 1

            return (
              <BreadcrumbItem key={index}>
                {isLast || !item.href ? (
                  <BreadcrumbPage className="text-indigo-300 font-medium">
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <>
                    <BreadcrumbLink asChild>
                      <Link
                        href={item.href}
                        className="hover:text-indigo-400 transition-colors"
                      >
                        {item.label}
                      </Link>
                    </BreadcrumbLink>
                    <BreadcrumbSeparator>
                      <ChevronLeft className="h-4 w-4 text-slate-500" />
                    </BreadcrumbSeparator>
                  </>
                )}
              </BreadcrumbItem>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}
