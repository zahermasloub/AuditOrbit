"use client"

/**
 * ============================================================================
 * HELP TOOLTIPS SYSTEM
 * نظام tooltips توضيحية للإعدادات والخيارات المعقدة
 * ============================================================================
 */

import { HelpCircle, Info, AlertCircle, CheckCircle } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// ============================================================================
// TYPES
// ============================================================================

type TooltipType = "info" | "help" | "warning" | "success"

interface HelpTooltipProps {
  content: string
  type?: TooltipType
  side?: "top" | "right" | "bottom" | "left"
  className?: string
  iconClassName?: string
}

// ============================================================================
// HELP TOOLTIP COMPONENT
// ============================================================================

/**
 * Tooltip توضيحية مع أيقونة
 */
export function HelpTooltip({
  content,
  type = "help",
  side = "top",
  className = "",
  iconClassName = "",
}: HelpTooltipProps) {
  const icons = {
    info: Info,
    help: HelpCircle,
    warning: AlertCircle,
    success: CheckCircle,
  }

  const colors = {
    info: "text-blue-400 hover:text-blue-300",
    help: "text-slate-400 hover:text-slate-300",
    warning: "text-amber-400 hover:text-amber-300",
    success: "text-emerald-400 hover:text-emerald-300",
  }

  const Icon = icons[type]

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={`inline-flex items-center justify-center transition-colors ${className}`}
        >
          <Icon className={`h-4 w-4 ${colors[type]} ${iconClassName}`} />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side={side}
        className="max-w-xs bg-slate-900 border border-slate-700 text-slate-200 shadow-lg"
      >
        <p className="text-sm leading-relaxed">{content}</p>
      </TooltipContent>
    </Tooltip>
  )
}

// ============================================================================
// FIELD WITH HELP
// ============================================================================

interface FieldWithHelpProps {
  label: string
  help: string
  required?: boolean
  children: React.ReactNode
  className?: string
}

/**
 * مكون حقل مع label و tooltip توضيحية
 */
export function FieldWithHelp({
  label,
  help,
  required = false,
  children,
  className = "",
}: FieldWithHelpProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-slate-200">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
        <HelpTooltip content={help} />
      </div>
      {children}
    </div>
  )
}

// ============================================================================
// INFO BOX WITH TOOLTIP
// ============================================================================

interface InfoBoxProps {
  title: string
  description: string
  detailedHelp?: string
  type?: "info" | "warning" | "success"
  className?: string
}

/**
 * صندوق معلومات مع tooltip إضافية
 */
export function InfoBox({
  title,
  description,
  detailedHelp,
  type = "info",
  className = "",
}: InfoBoxProps) {
  const colors = {
    info: "bg-blue-500/10 border-blue-500/30 text-blue-300",
    warning: "bg-amber-500/10 border-amber-500/30 text-amber-300",
    success: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
  }

  const icons = {
    info: Info,
    warning: AlertCircle,
    success: CheckCircle,
  }

  const Icon = icons[type]

  return (
    <div
      className={`p-4 rounded-lg border ${colors[type]} ${className}`}
    >
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-semibold">{title}</h4>
            {detailedHelp && (
              <HelpTooltip content={detailedHelp} type="info" />
            )}
          </div>
          <p className="text-sm opacity-90">{description}</p>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// COMMON TOOLTIPS - رسائل شائعة
// ============================================================================

export const COMMON_TOOLTIPS = {
  // User Management
  userRole:
    "الدور يحدد الصلاحيات المتاحة للمستخدم. Admin لديه صلاحيات كاملة، Manager يمكنه إدارة المهام، Auditor يمكنه تنفيذ المهام فقط.",
  userEmail: "البريد الإلكتروني يُستخدم لتسجيل الدخول وإرسال الإشعارات",
  userPassword:
    "كلمة المرور يجب أن تكون 8 أحرف على الأقل وتحتوي على حروف وأرقام ورموز",

  // Engagements
  engagementStatus:
    "حالة المهمة: مسودة (قيد الإعداد)، نشطة (جاري التنفيذ)، مكتملة (انتهت)",
  engagementPriority:
    "الأولوية تحدد ترتيب المهام. حرج (فوري)، عالي (هام)، متوسط (عادي)، منخفض (غير عاجل)",
  engagementRiskLevel:
    "مستوى المخاطر يعكس خطورة المهمة على المؤسسة: عالي، متوسط، منخفض",

  // Findings
  findingSeverity:
    "خطورة النتيجة: حرج (يتطلب إجراء فوري)، عالي (هام)، متوسط (يحتاج متابعة)، منخفض (ملاحظة)",
  findingStatus:
    "حالة النتيجة: مفتوحة (جديدة)، قيد المعالجة (يتم العمل عليها)، مغلقة (تم حلها)",

  // Reports
  reportType:
    "نوع التقرير: داخلي (للاستخدام الداخلي)، رسمي (للجهات الخارجية)، ملخص (موجز)",
  reportConfidentiality:
    "مستوى السرية: عام، محدود، سري، سري جداً",

  // System
  autoSave: "الحفظ التلقائي ينشط كل 30 ثانية لحماية بياناتك",
  dataRetention: "يتم الاحتفاظ بالبيانات المحذوفة لمدة 30 يوماً قبل الحذف النهائي",
  auditLog: "جميع العمليات يتم تسجيلها تلقائياً لأغراض التدقيق والأمان",
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * مثال على الاستخدام:
 * 
 * ```tsx
 * // Tooltip بسيطة
 * <HelpTooltip content="هذا نص توضيحي" />
 * 
 * // Tooltip مع نوع محدد
 * <HelpTooltip content="تحذير مهم!" type="warning" />
 * 
 * // حقل مع Help
 * <FieldWithHelp
 *   label="البريد الإلكتروني"
 *   help={COMMON_TOOLTIPS.userEmail}
 *   required
 * >
 *   <Input type="email" />
 * </FieldWithHelp>
 * 
 * // صندوق معلومات
 * <InfoBox
 *   title="معلومة مهمة"
 *   description="هذه معلومة أساسية"
 *   detailedHelp="تفاصيل إضافية عند الحاجة"
 *   type="info"
 * />
 * ```
 */
