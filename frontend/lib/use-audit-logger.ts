"use client"

/**
 * ============================================================================
 * AUDIT LOGGER HOOK
 * Hook لاستخدام نظام Audit Logging في المكونات
 * ============================================================================
 */

import { useCallback } from "react"
import { useAuth } from "./auth-context"
import { auditLogger } from "./audit-logger"
import type { AuditEventType, AuditSeverity } from "./audit-logger"

/**
 * Hook لاستخدام Audit Logger مع معلومات المستخدم الحالي
 */
export function useAuditLogger() {
  const { user } = useAuth()

  /**
   * تسجيل حدث مخصص
   */
  const logEvent = useCallback(
    async (
      type: AuditEventType,
      action: string,
      description: string,
      options?: {
        severity?: AuditSeverity
        resource?: string
        resourceId?: string
        metadata?: Record<string, unknown>
        changes?: {
          before?: Record<string, unknown>
          after?: Record<string, unknown>
        }
      }
    ) => {
      await auditLogger.log({
        type,
        severity: options?.severity || "low",
        status: "success",
        userId: user?.id,
        userName: user?.name,
        userRole: user?.role,
        userEmail: user?.email,
        action,
        description,
        resource: options?.resource,
        resourceId: options?.resourceId,
        metadata: options?.metadata,
        changes: options?.changes,
      })
    },
    [user]
  )

  /**
   * تسجيل إنشاء مورد
   */
  const logCreate = useCallback(
    async (
      resource: string,
      resourceId: string,
      data: Record<string, unknown>
    ) => {
      await auditLogger.logCreate(
        resource,
        resourceId,
        data,
        user?.id,
        user?.name
      )
    },
    [user]
  )

  /**
   * تسجيل تحديث مورد
   */
  const logUpdate = useCallback(
    async (
      resource: string,
      resourceId: string,
      before: Record<string, unknown>,
      after: Record<string, unknown>
    ) => {
      await auditLogger.logUpdate(
        resource,
        resourceId,
        before,
        after,
        user?.id,
        user?.name
      )
    },
    [user]
  )

  /**
   * تسجيل حذف مورد
   */
  const logDelete = useCallback(
    async (
      resource: string,
      resourceId: string,
      data: Record<string, unknown>
    ) => {
      await auditLogger.logDelete(
        resource,
        resourceId,
        data,
        user?.id,
        user?.name
      )
    },
    [user]
  )

  /**
   * تسجيل محاولة وصول غير مصرح بها
   */
  const logUnauthorizedAccess = useCallback(
    async (resource: string) => {
      await auditLogger.logUnauthorizedAccess(resource, user?.id, user?.name)
    },
    [user]
  )

  /**
   * تسجيل رفض صلاحية
   */
  const logPermissionDenied = useCallback(
    async (resource: string, action: string) => {
      await auditLogger.logPermissionDenied(
        resource,
        action,
        user?.id,
        user?.name
      )
    },
    [user]
  )

  return {
    logEvent,
    logCreate,
    logUpdate,
    logDelete,
    logUnauthorizedAccess,
    logPermissionDenied,
  }
}

/**
 * مثال على الاستخدام:
 * 
 * ```tsx
 * function MyComponent() {
 *   const { logCreate, logUpdate, logDelete } = useAuditLogger()
 * 
 *   const handleCreate = async () => {
 *     const newItem = { name: "Test", status: "active" }
 *     // ... إنشاء العنصر في API
 *     await logCreate("engagement", "123", newItem)
 *   }
 * 
 *   const handleUpdate = async () => {
 *     const before = { name: "Old", status: "draft" }
 *     const after = { name: "New", status: "active" }
 *     // ... تحديث العنصر في API
 *     await logUpdate("engagement", "123", before, after)
 *   }
 * 
 *   const handleDelete = async () => {
 *     const item = { name: "Test", status: "active" }
 *     // ... حذف العنصر من API
 *     await logDelete("engagement", "123", item)
 *   }
 * 
 *   return (...)
 * }
 * ```
 */
