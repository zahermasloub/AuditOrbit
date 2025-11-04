"use client"

import React, { useState, useEffect } from "react"
import { Shield, Lock, Mail, Eye, EyeOff, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { apiClient, TokenManager } from "@/lib/api-client"
import { CookieManager } from "@/lib/cookie-manager"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // 🔧 FIX: منع حلقة إعادة التوجيه - حذف Token عند دخول صفحة تسجيل الدخول
  useEffect(() => {
    // فحص فقط في المتصفح (Client-Side)
    if (typeof window === 'undefined') return
    
    // إذا كان هناك redirect parameter في URL، احتفظ بـ Token
    const urlParams = new URLSearchParams(window.location.search)
    const hasRedirect = urlParams.has('redirect')
    
    if (!hasRedirect) {
      // 🔧 FIX: استخدام CookieManager للحذف
      CookieManager.clearAuth()
    }
  }, [])

  const performLogin = async (loginEmail: string, loginPassword: string, redirectPath = "/admin") => {
    const trimmedEmail = loginEmail.trim()
    const sanitizedPassword = loginPassword.trim()

    if (!trimmedEmail || !sanitizedPassword) {
      setError("الرجاء إدخال البريد الإلكتروني وكلمة المرور")
      return false
    }

    if (sanitizedPassword.length < 8) {
      setError("كلمة المرور يجب أن تتكون من 8 أحرف على الأقل")
      return false
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await apiClient.POST("/auth/login", {
        body: {
          email: trimmedEmail,
          password: sanitizedPassword,
        },
      })

      if (response.data) {
        const tokenData = response.data as any

        if (tokenData.access_token) {
          // 🔧 FIX: استخدام CookieManager لحفظ Token
          TokenManager.setToken(tokenData.access_token)
          CookieManager.setAuthToken(tokenData.access_token)
        }
        if (tokenData.refresh_token) {
          TokenManager.setRefreshToken(tokenData.refresh_token)
          CookieManager.setRefreshToken(tokenData.refresh_token)
        }
        if (tokenData.user) {
          localStorage.setItem("user", JSON.stringify(tokenData.user))
        }

        window.location.href = redirectPath
        return true
      }

      if (response.error) {
        const apiError = response.error as any
        const message =
          apiError?.error?.message ||
          apiError?.message ||
          apiError?.error?.details?.errors?.[0]?.message ||
          "بيانات تسجيل الدخول غير صحيحة"
        setError(message)
      }
      return false
    } catch (err: any) {
      console.error("Login error:", err)
      const fallbackMessage = err?.message?.includes("401")
        ? "بيانات تسجيل الدخول غير صحيحة"
        : "حدث خطأ أثناء تسجيل الدخول"
      setError(fallbackMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()
    setEmail(trimmedEmail)
    setPassword(trimmedPassword)
    await performLogin(trimmedEmail, trimmedPassword)
  }

  const handleQuickLogin = async (loginEmail: string, loginPassword: string, redirectPath = "/admin") => {
    setEmail(loginEmail)
    setPassword(loginPassword)
    await performLogin(loginEmail, loginPassword, redirectPath)
  }

  const quickAccounts = [
    {
      label: "👨‍💼 Admin",
      email: "admin@example.com",
      password: "Admin#2025",
      redirect: "/admin",
      className: "bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs",
    },
    {
      label: "🛠️ Test Admin",
      email: "admin@audit.com",
      password: "admin123",
      redirect: "/admin",
      className: "bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs",
    },
  ] as const

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-600/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-cyan-600/10 via-transparent to-transparent" />

      {/* Login Card */}
      <Card className="w-full max-w-md relative bg-slate-900/50 border-slate-800 backdrop-blur-xl">
        <CardHeader className="space-y-4 text-center">
          {/* Logo */}
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/50">
            <Shield className="h-8 w-8 text-white" />
          </div>

          <div>
            <CardTitle className="text-3xl font-bold text-white">AuditOrbit</CardTitle>
            <CardDescription className="text-slate-400 mt-2">منصة التدقيق الداخلي الذكية</CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">
                البريد الإلكتروني
              </Label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@auditOrbit.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pr-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500"
                  dir="ltr"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">
                كلمة المرور
              </Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10 pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500"
                  dir="ltr"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-700 bg-slate-800/50 text-indigo-600" />
                <span>تذكرني</span>
              </label>
              <a href="#" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                نسيت كلمة المرور؟
              </a>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white font-semibold py-6 text-base shadow-lg shadow-indigo-500/30"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>جاري تسجيل الدخول...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>تسجيل الدخول</span>
                  <ArrowRight className="h-5 w-5" />
                </div>
              )}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
            <p className="text-xs text-slate-400 text-center mb-2">للاختبار استخدم:</p>
            <div className="space-y-1 text-xs text-slate-300 font-mono text-center">
              <p>
                <span className="text-indigo-400">البريد:</span> admin@example.com
              </p>
              <p>
                <span className="text-cyan-400">كلمة المرور:</span> Admin#2025
              </p>
            </div>
          </div>

          {/* Mock Login Buttons - للتطوير */}
          <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <p className="text-xs text-slate-400 text-center mb-3">🚀 تسجيل دخول سريع بالحسابات الحقيقية</p>
            <div className="grid grid-cols-2 gap-2">
              {quickAccounts.map((account) => (
                <Button
                  key={account.email}
                  type="button"
                  onClick={() => handleQuickLogin(account.email, account.password, account.redirect)}
                  className={account.className}
                  disabled={isLoading}
                >
                  {account.label}
                </Button>
              ))}
            </div>
            <p className="text-[11px] text-center text-amber-300/80 mt-3">
              يتم تسجيل الدخول عبر واجهة الـ API الحقيقية وتخزين الرموز بأمان.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="absolute bottom-4 text-center text-sm text-slate-500">
        <p>© 2025 AuditOrbit. جميع الحقوق محفوظة.</p>
      </div>
    </div>
  )
}
