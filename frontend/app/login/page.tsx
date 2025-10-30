"use client"

import type React from "react"

import { useState } from "react"
import { Shield, Lock, Mail, Eye, EyeOff, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { apiClient, TokenManager } from "@/lib/api-client"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await apiClient.POST('/auth/login', {
        body: {
          email: email,
          password: password
        }
      })

      if (response.data) {
        const tokenData = response.data as any
        
        // حفظ الـ Token
        if (tokenData.access_token) {
          TokenManager.setToken(tokenData.access_token)
        }
        if (tokenData.refresh_token) {
          TokenManager.setRefreshToken(tokenData.refresh_token)
        }
        
        // الانتقال للـ Dashboard
        window.location.href = "/dashboard"
      } else if (response.error) {
        // عرض رسالة الخطأ
        setError('بيانات تسجيل الدخول غير صحيحة')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('حدث خطأ أثناء تسجيل الدخول')
    } finally {
      setIsLoading(false)
    }
  }

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
            <p className="text-xs text-slate-400 text-center mb-3">🚀 تسجيل دخول سريع (Mock)</p>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                onClick={() => {
                  const mockUser = {
                    id: "1",
                    name: "مدير النظام",
                    email: "admin@test.com",
                    role: "admin"
                  }
                  localStorage.setItem("auth_token", "mock_admin_token")
                  localStorage.setItem("user", JSON.stringify(mockUser))
                  window.location.href = "/admin"
                }}
                className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs"
              >
                👨‍💼 Admin
              </Button>
              
              <Button
                type="button"
                onClick={() => {
                  const mockUser = {
                    id: "2",
                    name: "مدير المراجعة",
                    email: "manager@test.com",
                    role: "manager"
                  }
                  localStorage.setItem("auth_token", "mock_manager_token")
                  localStorage.setItem("user", JSON.stringify(mockUser))
                  window.location.href = "/manager"
                }}
                className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 text-xs"
              >
                👔 Manager
              </Button>
              
              <Button
                type="button"
                onClick={() => {
                  const mockUser = {
                    id: "3",
                    name: "المدقق",
                    email: "auditor@test.com",
                    role: "auditor"
                  }
                  localStorage.setItem("auth_token", "mock_auditor_token")
                  localStorage.setItem("user", JSON.stringify(mockUser))
                  window.location.href = "/auditor"
                }}
                className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 text-green-300 text-xs"
              >
                📝 Auditor
              </Button>
            </div>
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
