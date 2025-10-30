/**
 * ============================================================================
 * AUDIT LOGGING SYSTEM
 * نظام تتبع وتسجيل جميع العمليات الحرجة في النظام
 * ============================================================================
 */

import type { UserRole } from "./auth-context"

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * أنواع الأحداث التي يتم تسجيلها
 */
export type AuditEventType =
  // Authentication Events
  | "auth.login"
  | "auth.logout"
  | "auth.login_failed"
  | "auth.session_expired"
  | "auth.password_changed"
  
  // User Management
  | "user.created"
  | "user.updated"
  | "user.deleted"
  | "user.role_changed"
  | "user.permissions_changed"
  
  // Engagement Events
  | "engagement.created"
  | "engagement.updated"
  | "engagement.deleted"
  | "engagement.status_changed"
  | "engagement.assigned"
  
  // Finding Events
  | "finding.created"
  | "finding.updated"
  | "finding.deleted"
  | "finding.severity_changed"
  | "finding.status_changed"
  
  // Report Events
  | "report.created"
  | "report.updated"
  | "report.published"
  | "report.deleted"
  | "report.exported"
  
  // Document Events
  | "document.uploaded"
  | "document.downloaded"
  | "document.deleted"
  | "document.shared"
  
  // Settings Events
  | "settings.updated"
  | "settings.reset"
  
  // System Events
  | "system.backup_created"
  | "system.backup_restored"
  | "system.config_changed"
  
  // Security Events
  | "security.unauthorized_access"
  | "security.permission_denied"
  | "security.suspicious_activity"

/**
 * مستوى خطورة الحدث
 */
export type AuditSeverity = "low" | "medium" | "high" | "critical"

/**
 * حالة العملية
 */
export type AuditStatus = "success" | "failure" | "pending"

/**
 * بيانات الحدث
 */
export interface AuditEvent {
  id: string
  timestamp: string
  type: AuditEventType
  severity: AuditSeverity
  status: AuditStatus
  
  // معلومات المستخدم
  userId?: string
  userName?: string
  userRole?: UserRole
  userEmail?: string
  
  // معلومات الحدث
  action: string
  resource?: string
  resourceId?: string
  
  // التفاصيل
  description: string
  metadata?: Record<string, unknown>
  changes?: {
    before?: Record<string, unknown>
    after?: Record<string, unknown>
  }
  
  // معلومات تقنية
  ipAddress?: string
  userAgent?: string
  sessionId?: string
  
  // النتيجة
  errorMessage?: string
  errorStack?: string
}

/**
 * إعدادات Audit Logger
 */
interface AuditLoggerConfig {
  enabled: boolean
  endpoint?: string
  localStorageKey: string
  maxLocalLogs: number
  batchSize: number
  flushInterval: number
  includeSensitiveData: boolean
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const DEFAULT_CONFIG: AuditLoggerConfig = {
  enabled: true,
  endpoint: "/api/audit/log",
  localStorageKey: "audit_logs",
  maxLocalLogs: 1000,
  batchSize: 10,
  flushInterval: 30000, // 30 seconds
  includeSensitiveData: false,
}

// ============================================================================
// AUDIT LOGGER CLASS
// ============================================================================

class AuditLogger {
  private config: AuditLoggerConfig
  private pendingLogs: AuditEvent[] = []
  private flushTimer: NodeJS.Timeout | null = null

  constructor(config: Partial<AuditLoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    
    // تحميل السجلات المعلقة من localStorage
    this.loadPendingLogs()
    
    // بدء مؤقت الإرسال التلقائي
    if (this.config.enabled) {
      this.startFlushTimer()
    }
  }

  /**
   * تسجيل حدث جديد
   */
  async log(event: Omit<AuditEvent, "id" | "timestamp">): Promise<void> {
    if (!this.config.enabled) return

    const fullEvent: AuditEvent = {
      ...event,
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      ipAddress: await this.getIpAddress(),
      userAgent: this.getUserAgent(),
      sessionId: this.getSessionId(),
    }

    // إضافة إلى قائمة الانتظار
    this.pendingLogs.push(fullEvent)

    // حفظ في localStorage
    this.savePendingLogs()

    // إرسال فوري للأحداث الحرجة
    if (fullEvent.severity === "critical") {
      await this.flush()
    }

    // إرسال إذا وصلنا لحجم الدفعة
    if (this.pendingLogs.length >= this.config.batchSize) {
      await this.flush()
    }
  }

  /**
   * تسجيل تسجيل دخول ناجح
   */
  async logLogin(userId: string, userName: string, userRole: UserRole): Promise<void> {
    await this.log({
      type: "auth.login",
      severity: "low",
      status: "success",
      userId,
      userName,
      userRole,
      action: "تسجيل دخول",
      description: `قام ${userName} بتسجيل الدخول بنجاح`,
    })
  }

  /**
   * تسجيل محاولة تسجيل دخول فاشلة
   */
  async logLoginFailed(email: string, reason: string): Promise<void> {
    await this.log({
      type: "auth.login_failed",
      severity: "medium",
      status: "failure",
      userEmail: email,
      action: "محاولة تسجيل دخول فاشلة",
      description: `فشل تسجيل الدخول: ${reason}`,
      errorMessage: reason,
    })
  }

  /**
   * تسجيل تسجيل خروج
   */
  async logLogout(userId: string, userName: string): Promise<void> {
    await this.log({
      type: "auth.logout",
      severity: "low",
      status: "success",
      userId,
      userName,
      action: "تسجيل خروج",
      description: `قام ${userName} بتسجيل الخروج`,
    })
  }

  /**
   * تسجيل إنشاء كائن
   */
  async logCreate(
    resource: string,
    resourceId: string,
    data: Record<string, unknown>,
    userId?: string,
    userName?: string
  ): Promise<void> {
    await this.log({
      type: `${resource}.created` as AuditEventType,
      severity: "low",
      status: "success",
      userId,
      userName,
      action: `إنشاء ${resource}`,
      resource,
      resourceId,
      description: `تم إنشاء ${resource} جديد بنجاح`,
      changes: {
        after: data,
      },
    })
  }

  /**
   * تسجيل تحديث كائن
   */
  async logUpdate(
    resource: string,
    resourceId: string,
    before: Record<string, unknown>,
    after: Record<string, unknown>,
    userId?: string,
    userName?: string
  ): Promise<void> {
    await this.log({
      type: `${resource}.updated` as AuditEventType,
      severity: "medium",
      status: "success",
      userId,
      userName,
      action: `تحديث ${resource}`,
      resource,
      resourceId,
      description: `تم تحديث ${resource} بنجاح`,
      changes: {
        before,
        after,
      },
    })
  }

  /**
   * تسجيل حذف كائن
   */
  async logDelete(
    resource: string,
    resourceId: string,
    data: Record<string, unknown>,
    userId?: string,
    userName?: string
  ): Promise<void> {
    await this.log({
      type: `${resource}.deleted` as AuditEventType,
      severity: "high",
      status: "success",
      userId,
      userName,
      action: `حذف ${resource}`,
      resource,
      resourceId,
      description: `تم حذف ${resource} بنجاح`,
      changes: {
        before: data,
      },
    })
  }

  /**
   * تسجيل محاولة وصول غير مصرح بها
   */
  async logUnauthorizedAccess(
    resource: string,
    userId?: string,
    userName?: string
  ): Promise<void> {
    await this.log({
      type: "security.unauthorized_access",
      severity: "critical",
      status: "failure",
      userId,
      userName,
      action: "محاولة وصول غير مصرح بها",
      resource,
      description: `محاولة وصول غير مصرح بها إلى ${resource}`,
    })
  }

  /**
   * تسجيل رفض صلاحية
   */
  async logPermissionDenied(
    resource: string,
    action: string,
    userId?: string,
    userName?: string
  ): Promise<void> {
    await this.log({
      type: "security.permission_denied",
      severity: "high",
      status: "failure",
      userId,
      userName,
      action: `محاولة ${action} على ${resource}`,
      resource,
      description: `تم رفض الصلاحية لـ ${action} على ${resource}`,
    })
  }

  /**
   * إرسال جميع السجلات المعلقة
   */
  async flush(): Promise<void> {
    if (this.pendingLogs.length === 0) return

    const logsToSend = [...this.pendingLogs]
    this.pendingLogs = []
    this.savePendingLogs()

    try {
      if (this.config.endpoint) {
        await fetch(this.config.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ events: logsToSend }),
        })
      }

      // يمكن أيضاً إرسال إلى console في بيئة التطوير
      if (process.env.NODE_ENV === "development") {
        console.group("📋 Audit Logs")
        logsToSend.forEach((log) => {
          const emoji = {
            low: "ℹ️",
            medium: "⚠️",
            high: "🔴",
            critical: "🚨",
          }[log.severity]
          console.log(`${emoji} [${log.type}] ${log.description}`, log)
        })
        console.groupEnd()
      }
    } catch (error) {
      // إعادة السجلات إلى قائمة الانتظار في حالة الفشل
      this.pendingLogs.unshift(...logsToSend)
      this.savePendingLogs()
      console.error("Failed to send audit logs:", error)
    }
  }

  /**
   * الحصول على جميع السجلات المحلية
   */
  getLocalLogs(): AuditEvent[] {
    // إرجاع مصفوفة فارغة في بيئة Server-Side
    if (typeof window === "undefined") return []
    
    try {
      const stored = localStorage.getItem(this.config.localStorageKey)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  /**
   * مسح جميع السجلات المحلية
   */
  clearLocalLogs(): void {
    this.pendingLogs = []
    
    // تجاهل في بيئة Server-Side
    if (typeof window === "undefined") return
    
    localStorage.removeItem(this.config.localStorageKey)
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private async getIpAddress(): Promise<string | undefined> {
    // يمكن استدعاء API للحصول على IP في بيئة الإنتاج
    return undefined
  }

  private getUserAgent(): string | undefined {
    return typeof navigator !== "undefined" ? navigator.userAgent : undefined
  }

  private getSessionId(): string | undefined {
    // تجاهل في بيئة Server-Side
    if (typeof window === "undefined") return undefined
    
    // يمكن استخدام session ID من المصادقة
    return sessionStorage.getItem("sessionId") || undefined
  }

  private loadPendingLogs(): void {
    // تجاهل في بيئة Server-Side
    if (typeof window === "undefined") return
    
    try {
      const stored = localStorage.getItem(this.config.localStorageKey)
      if (stored) {
        this.pendingLogs = JSON.parse(stored)
      }
    } catch (error) {
      console.error("Failed to load pending audit logs:", error)
    }
  }

  private savePendingLogs(): void {
    // تجاهل في بيئة Server-Side
    if (typeof window === "undefined") return
    
    try {
      // الاحتفاظ فقط بآخر N سجل
      const logsToSave = this.pendingLogs.slice(-this.config.maxLocalLogs)
      localStorage.setItem(
        this.config.localStorageKey,
        JSON.stringify(logsToSave)
      )
    } catch (error) {
      console.error("Failed to save pending audit logs:", error)
    }
  }

  private startFlushTimer(): void {
    // تجاهل في بيئة Server-Side
    if (typeof window === "undefined") return
    
    this.flushTimer = setInterval(() => {
      this.flush().catch(console.error)
    }, this.config.flushInterval)
  }

  private stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
      this.flushTimer = null
    }
  }

  /**
   * تنظيف عند إيقاف التطبيق
   */
  destroy(): void {
    this.stopFlushTimer()
    this.flush().catch(console.error)
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const auditLogger = new AuditLogger()

// تنظيف عند إغلاق النافذة
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    auditLogger.flush()
  })
}
