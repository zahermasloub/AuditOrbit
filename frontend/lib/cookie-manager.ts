/**
 * Cookie Manager - إدارة مركزية لـ Cookies
 * 
 * هذا الملف يوفر واجهة موحدة لإدارة Cookies
 * مع التأكد من التزامن مع localStorage
 */

// ============================================================================
// CONSTANTS
// ============================================================================

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 // 7 أيام بالثواني

// ============================================================================
// COOKIE UTILITIES
// ============================================================================

export class CookieManager {
  /**
   * حفظ Token في كل من localStorage و cookies
   */
  static setAuthToken(token: string): void {
    // حفظ في localStorage
    localStorage.setItem("auth_token", token)
    
    // حفظ في cookies للـ Middleware
    document.cookie = `auth_token=${token}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax; Secure`
  }

  /**
   * حفظ Refresh Token
   */
  static setRefreshToken(token: string): void {
    localStorage.setItem("refresh_token", token)
  }

  /**
   * الحصول على Auth Token من localStorage
   */
  static getAuthToken(): string | null {
    return localStorage.getItem("auth_token")
  }

  /**
   * الحصول على Refresh Token من localStorage
   */
  static getRefreshToken(): string | null {
    return localStorage.getItem("refresh_token")
  }

  /**
   * حذف جميع بيانات المصادقة
   */
  static clearAuth(): void {
    // حذف من localStorage
    localStorage.removeItem("auth_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("user")
    
    // حذف من cookies
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
  }

  /**
   * التحقق من وجود Token صالح
   */
  static hasValidToken(): boolean {
    const token = this.getAuthToken()
    if (!token) return false

    try {
      // فك تشفير JWT لفحص انتهاء الصلاحية
      const payload = JSON.parse(atob(token.split('.')[1]))
      
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        // Token منتهي الصلاحية
        this.clearAuth()
        return false
      }

      return true
    } catch {
      return false
    }
  }

  /**
   * مزامنة Token من localStorage إلى cookies
   * مفيد عند تحميل الصفحة للتأكد من التزامن
   */
  static syncTokenToCookies(): void {
    const token = this.getAuthToken()
    if (token) {
      document.cookie = `auth_token=${token}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax; Secure`
    }
  }
}
