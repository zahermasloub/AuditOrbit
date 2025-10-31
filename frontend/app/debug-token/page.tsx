"use client"

import { useEffect, useState } from "react"
import { Shield, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TokenManager } from "@/lib/api-client"

export default function TokenDebugPage() {
  const [tokenInfo, setTokenInfo] = useState<any>(null)
  const [isChecking, setIsChecking] = useState(false)

  const checkToken = () => {
    setIsChecking(true)
    setTimeout(() => {
      const token = TokenManager.getToken()
      const refreshToken = TokenManager.getRefreshToken()
      const user = localStorage.getItem("user")
      
      setTokenInfo({
        hasToken: !!token,
        tokenPreview: token ? `${token.substring(0, 30)}...` : null,
        hasRefreshToken: !!refreshToken,
        hasUser: !!user,
        user: user ? JSON.parse(user) : null,
        allKeys: Object.keys(localStorage),
      })
      setIsChecking(false)
    }, 300)
  }

  useEffect(() => {
    checkToken()
  }, [])

  const clearAll = () => {
    localStorage.clear()
    checkToken()
  }

  const goToLogin = () => {
    window.location.href = "/login"
  }

  const goToAdmin = () => {
    window.location.href = "/admin"
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4" dir="rtl">
      <Card className="w-full max-w-2xl bg-slate-900 border-slate-800">
        <CardHeader className="border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-white text-xl">فحص حالة المصادقة</CardTitle>
              <CardDescription className="text-slate-400">
                أداة تصحيح الأخطاء - Token Debug Tool
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {/* Status Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
              <span className="text-slate-300">حالة التوكن:</span>
              <div className="flex items-center gap-2">
                {tokenInfo?.hasToken ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-green-400 font-medium">موجود</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span className="text-red-400 font-medium">غير موجود</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
              <span className="text-slate-300">Refresh Token:</span>
              <div className="flex items-center gap-2">
                {tokenInfo?.hasRefreshToken ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-green-400 font-medium">موجود</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span className="text-red-400 font-medium">غير موجود</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
              <span className="text-slate-300">بيانات المستخدم:</span>
              <div className="flex items-center gap-2">
                {tokenInfo?.hasUser ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-green-400 font-medium">موجودة</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span className="text-red-400 font-medium">غير موجودة</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Details Section */}
          {tokenInfo && (
            <div className="space-y-3">
              {tokenInfo.tokenPreview && (
                <div className="p-4 bg-slate-800 rounded-lg">
                  <div className="text-sm text-slate-400 mb-2">معاينة التوكن:</div>
                  <div className="text-xs text-slate-300 font-mono break-all">
                    {tokenInfo.tokenPreview}
                  </div>
                </div>
              )}

              {tokenInfo.user && (
                <div className="p-4 bg-slate-800 rounded-lg">
                  <div className="text-sm text-slate-400 mb-2">معلومات المستخدم:</div>
                  <div className="text-sm text-slate-300 space-y-1">
                    <div>الاسم: {tokenInfo.user.name}</div>
                    <div>البريد: {tokenInfo.user.email}</div>
                    <div>الدور: {tokenInfo.user.role}</div>
                  </div>
                </div>
              )}

              <div className="p-4 bg-slate-800 rounded-lg">
                <div className="text-sm text-slate-400 mb-2">مفاتيح localStorage:</div>
                <div className="text-xs text-slate-300 font-mono">
                  {tokenInfo.allKeys.join(", ") || "لا توجد مفاتيح"}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-800">
            <Button
              onClick={checkToken}
              disabled={isChecking}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className={`h-4 w-4 ml-2 ${isChecking ? "animate-spin" : ""}`} />
              إعادة الفحص
            </Button>
            
            <Button
              onClick={clearAll}
              variant="outline"
              className="flex-1 border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
            >
              حذف الكل
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={goToLogin}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              تسجيل الدخول
            </Button>
            
            <Button
              onClick={goToAdmin}
              disabled={!tokenInfo?.hasToken}
              className="flex-1 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              لوحة الإدارة
            </Button>
          </div>

          {/* Instructions */}
          <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <div className="text-sm text-blue-400 space-y-2">
              <div className="font-medium">📝 ملاحظات:</div>
              <ul className="text-xs space-y-1 mr-4">
                <li>• إذا كان التوكن غير موجود، قم بتسجيل الدخول مرة أخرى</li>
                <li>• يجب أن يكون التوكن موجوداً تحت المفتاح "auth_token"</li>
                <li>• افتح Console (F12) لرؤية رسائل التصحيح</li>
                <li>• إذا استمرت المشكلة، جرب مسح البيانات وإعادة تسجيل الدخول</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
