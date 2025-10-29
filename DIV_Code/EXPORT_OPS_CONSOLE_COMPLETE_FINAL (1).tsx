/*
================================================================================
  بوابة العمليات الموحدة (Ops Console Portal)
  ملف تصدير كامل وشامل 100%
================================================================================

📋 المحتويات:
  1. Layout (التخطيط الرئيسي مع القائمة الجانبية)
  2. Overview Page (نظرة عامة مع مراقبة لحظية)
  3. API Explorer (مستكشف API مع Swagger وReDoc)
  4. Storage Management (إدارة التخزين MinIO)
  5. AI Tasks Monitoring (مراقبة مهام AI)
  6. Settings (الإعدادات)
  7. Logs & Alerts (السجلات والتنبيهات)
  8. Next.js Configuration (إعدادات next.config.mjs)

🎨 نظام الألوان:
  - Primary: Indigo (indigo-600, indigo-500, indigo-400)
  - Secondary: Cyan (cyan-600, cyan-500, cyan-400)
  - Background: Slate (slate-950, slate-900, slate-800)
  - Success: Emerald
  - Warning: Orange
  - Error: Rose

🔗 الروابط:
  - الصفحة الرئيسية: /ops
  - مستكشف API: /ops/api
  - التخزين: /ops/storage
  - مهام AI: /ops/ai
  - الإعدادات: /ops/settings
  - السجلات: /ops/logs

================================================================================
*/

// ============================================================================
// 1. LAYOUT - التخطيط الرئيسي (app/ops/layout.tsx)
// ============================================================================

"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutGrid,
  Code2,
  Database,
  Cpu,
  Settings,
  FileText,
  Activity,
  ChevronRight,
  Bell,
  Search,
  User,
  Menu,
  X,
} from "lucide-react"
import { Suspense } from "react"

export default function OpsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const navItems = [
    { href: "/ops", label: "نظرة عامة", icon: LayoutGrid, badge: null },
    { href: "/ops/api", label: "مستكشف API", icon: Code2, badge: null },
    { href: "/ops/storage", label: "التخزين", icon: Database, badge: "2.4 GB" },
    { href: "/ops/ai", label: "مهام AI", icon: Cpu, badge: "12" },
    { href: "/ops/settings", label: "الإعدادات", icon: Settings, badge: null },
    { href: "/ops/logs", label: "السجلات", icon: FileText, badge: "3" },
  ]

  return (
    <div dir="rtl" className="min-h-screen bg-slate-950">
      {/* Glassmorphic Header */}
      <Suspense fallback={null}>
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-slate-800 shadow-lg">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Left Section */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-300 hover:text-indigo-400"
                >
                  {sidebarCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
                </button>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl blur-lg opacity-60" />
                    <div className="relative w-12 h-12 bg-gradient-to-br from-indigo-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                      <Activity className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-l from-indigo-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                      بوابة العمليات
                    </h1>
                    <p className="text-xs text-slate-400">Ops Console Portal</p>
                  </div>
                </div>
              </div>

              {/* Center Section - Search */}
              <div className="hidden md:flex flex-1 max-w-md mx-8">
                <div className="relative w-full">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="بحث في الخدمات والسجلات..."
                    className="w-full pr-10 pl-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse shadow-lg shadow-indigo-400/50" />
                  <span className="text-xs text-indigo-300 font-medium">البيئة: محلية</span>
                </div>

                <button className="relative p-2 hover:bg-slate-800/50 rounded-lg transition-colors text-slate-300 hover:text-indigo-400">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full shadow-lg shadow-rose-500/50" />
                </button>

                <div className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800/50 rounded-lg transition-colors cursor-pointer">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="hidden lg:block text-right">
                    <p className="text-sm font-medium text-slate-200">مدير النظام</p>
                    <p className="text-xs text-slate-400">DevOps Admin</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
      </Suspense>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside
          className={`${
            sidebarCollapsed ? "w-0 opacity-0" : "w-72 opacity-100"
          } transition-all duration-300 overflow-hidden`}
        >
          <div className="h-[calc(100vh-5rem)] p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-gradient-to-l from-indigo-600/30 to-cyan-600/30 border border-indigo-500/40 shadow-lg shadow-indigo-500/20"
                      : "hover:bg-slate-800/50 border border-transparent hover:border-slate-700/50"
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-indigo-400 via-cyan-400 to-indigo-400 rounded-r-full shadow-lg shadow-indigo-400/50" />
                  )}

                  <div
                    className={`p-2 rounded-lg transition-all ${
                      isActive
                        ? "bg-gradient-to-br from-indigo-600 to-cyan-600 shadow-lg shadow-indigo-500/40"
                        : "bg-slate-800/50 group-hover:bg-slate-700/50"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-400"}`}
                    />
                  </div>

                  <div className="flex-1">
                    <span
                      className={`font-medium ${
                        isActive ? "text-indigo-300" : "text-slate-300 group-hover:text-white"
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>

                  {item.badge && (
                    <span className="px-2 py-0.5 bg-indigo-500/20 border border-indigo-500/40 rounded-md text-xs text-indigo-300 font-medium shadow-sm">
                      {item.badge}
                    </span>
                  )}

                  <ChevronRight
                    className={`h-4 w-4 transition-all ${
                      isActive ? "text-indigo-400 opacity-100" : "text-slate-500 opacity-0 group-hover:opacity-100"
                    }`}
                  />
                </Link>
              )
            })}

            {/* System Status Card */}
            <div className="mt-6 p-4 bg-slate-900 border border-slate-800 rounded-xl shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-200">حالة النظام</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50" />
                  <span className="text-xs text-emerald-400 font-medium">نشط</span>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">API</span>
                  <span className="text-emerald-400 font-medium">✓ متصل</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Database</span>
                  <span className="text-emerald-400 font-medium">✓ متصل</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Redis</span>
                  <span className="text-emerald-400 font-medium">✓ متصل</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">MinIO</span>
                  <span className="text-emerald-400 font-medium">✓ متصل</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto h-[calc(100vh-5rem)]">{children}</main>
      </div>
    </div>
  )
}
// ============================================================================
// 2. OVERVIEW PAGE - نظرة عامة (app/ops/page.tsx)
// ============================================================================

;("use client")

import { useEffect, useState } from "react"
import {
  Activity,
  Database,
  Cpu,
  HardDrive,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Clock,
  Zap,
  Server,
  Wifi,
} from "lucide-react"

type HealthData = {
  status: string
  details: {
    db: string
    redis: string
    minio: string
    ai_worker: string
  }
}

type EventMsg = {
  type: string
  ts: string
  payload: any
}

export function OpsOverview() {
  const [health, setHealth] = useState<HealthData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [events, setEvents] = useState<EventMsg[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch health data
    fetch("/ops/api/ops/healthz-aggregate")
      .then((r) => r.json())
      .then((data) => {
        setHealth(data)
        setLoading(false)
      })
      .catch(() => {
        setError("تعذر الاتصال بالـ API")
        setLoading(false)
      })

    // Connect to SSE for real-time events
    const es = new EventSource("/ops/api/ops/events")
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        setEvents((prev) => [data, ...prev].slice(0, 50))
      } catch {}
    }
    es.onerror = () => {
      console.log("[v0] SSE connection error, will retry automatically")
    }

    return () => es.close()
  }, [])

  const services = [
    {
      name: "API Server",
      status: health?.details?.db === "ok" ? "online" : "offline",
      icon: Server,
      color: "indigo",
      metrics: { uptime: "99.9%", requests: "1.2M", latency: "45ms" },
    },
    {
      name: "Database",
      status: health?.details?.db === "ok" ? "online" : "offline",
      icon: Database,
      color: "cyan",
      metrics: { connections: "24", queries: "8.5K", size: "2.4 GB" },
    },
    {
      name: "Redis Cache",
      status: health?.details?.redis === "ok" ? "online" : "offline",
      icon: Zap,
      color: "orange",
      metrics: { keys: "1,234", memory: "128 MB", hits: "94%" },
    },
    {
      name: "MinIO Storage",
      status: health?.details?.minio === "ok" ? "online" : "offline",
      icon: HardDrive,
      color: "indigo",
      metrics: { buckets: "5", objects: "2,341", size: "8.7 GB" },
    },
    {
      name: "AI Worker",
      status: health?.details?.ai_worker === "ok" ? "online" : "offline",
      icon: Cpu,
      color: "cyan",
      metrics: { jobs: "12", queue: "3", processed: "1,456" },
    },
    {
      name: "Network",
      status: "online",
      icon: Wifi,
      color: "emerald",
      metrics: { bandwidth: "125 Mbps", packets: "45K", errors: "0" },
    },
  ]

  const systemMetrics = [
    { label: "استخدام CPU", value: "42%", trend: "up", change: "+5%", icon: Cpu, color: "indigo" },
    { label: "استخدام الذاكرة", value: "68%", trend: "down", change: "-3%", icon: Activity, color: "cyan" },
    { label: "مساحة التخزين", value: "11.1 GB", trend: "up", change: "+1.2 GB", icon: HardDrive, color: "orange" },
    { label: "الطلبات/دقيقة", value: "1,234", trend: "up", change: "+12%", icon: TrendingUp, color: "emerald" },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
          <p className="text-slate-300">جاري تحميل بيانات النظام...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-l from-indigo-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
          نظرة عامة على النظام
        </h2>
        <p className="text-slate-300">مراقبة شاملة لجميع خدمات البنية التحتية</p>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-rose-400" />
          <span className="text-rose-300">{error}</span>
        </div>
      )}

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemMetrics.map((metric, idx) => {
          const Icon = metric.icon
          const isUp = metric.trend === "up"

          return (
            <div
              key={idx}
              className="relative group overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/50 rounded-xl p-5 hover:border-indigo-500/40 transition-all hover:shadow-lg hover:shadow-indigo-500/10"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`p-3 bg-${metric.color}-500/10 border border-${metric.color}-500/30 rounded-lg shadow-sm`}
                  >
                    <Icon className={`h-6 w-6 text-${metric.color}-400`} />
                  </div>
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
                      isUp
                        ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                        : "bg-rose-500/10 text-rose-300 border border-rose-500/30"
                    }`}
                  >
                    {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {metric.change}
                  </div>
                </div>

                <p className="text-slate-400 text-sm mb-1">{metric.label}</p>
                <p className="text-3xl font-bold text-white">{metric.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Services Status Grid */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">حالة الخدمات</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service, idx) => {
            const Icon = service.icon
            const isOnline = service.status === "online"

            return (
              <div
                key={idx}
                className="relative group overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/50 rounded-xl p-5 hover:border-indigo-500/40 transition-all hover:shadow-lg hover:shadow-indigo-500/10"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`p-3 bg-${service.color}-500/10 border border-${service.color}-500/30 rounded-lg shadow-sm`}
                    >
                      <Icon className={`h-6 w-6 text-${service.color}-400`} />
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50" : "bg-rose-400"}`}
                      />
                      <span className={`text-xs font-medium ${isOnline ? "text-emerald-300" : "text-rose-300"}`}>
                        {isOnline ? "نشط" : "غير متصل"}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-white font-semibold mb-3">{service.name}</h4>

                  <div className="space-y-2">
                    {Object.entries(service.metrics).map(([key, value], i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-slate-400 capitalize">{key}</span>
                        <span className="text-slate-200 font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Events */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">الأحداث الأخيرة</h3>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse shadow-lg shadow-indigo-400/50" />
            <span className="text-xs text-indigo-300 font-medium">تحديث مباشر</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/50 rounded-xl overflow-hidden shadow-lg">
          {events.length === 0 ? (
            <div className="p-8 text-center">
              <Clock className="h-12 w-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-300">في انتظار الأحداث...</p>
              <p className="text-slate-500 text-sm mt-1">سيتم عرض الأحداث الجديدة هنا تلقائياً</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700/50 max-h-96 overflow-y-auto">
              {events.map((event, idx) => (
                <div key={idx} className="p-4 hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                      <Activity className="h-4 w-4 text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white">{event.type}</span>
                        <span className="text-xs text-slate-500">{event.ts}</span>
                      </div>
                      <pre className="text-xs text-slate-400 whitespace-pre-wrap overflow-x-auto">
                        {JSON.stringify(event.payload, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
// ============================================================================
// 3. API EXPLORER - مستكشف API (app/ops/api/page.tsx)
// ============================================================================

;("use client")

import { useState } from "react"
import { Code2, FileJson, ExternalLink } from "lucide-react"

export function ApiExplorer() {
  const [tab, setTab] = useState<"swagger" | "redoc">("swagger")

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-l from-indigo-400 to-cyan-400 bg-clip-text text-transparent mb-2">
          مستكشف الـ API
        </h2>
        <p className="text-slate-400">استكشاف وتجربة جميع نقاط النهاية (Endpoints) المتاحة</p>
      </div>

      {/* Tab Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setTab("swagger")}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
            tab === "swagger"
              ? "bg-gradient-to-l from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/30"
              : "bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-700/50"
          }`}
        >
          <Code2 className="h-5 w-5" />
          Swagger UI
        </button>
        <button
          onClick={() => setTab("redoc")}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
            tab === "redoc"
              ? "bg-gradient-to-l from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/30"
              : "bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-700/50"
          }`}
        >
          <FileJson className="h-5 w-5" />
          ReDoc
        </button>

        <a
          href="/ops/api/openapi.json"
          target="_blank"
          rel="noopener noreferrer"
          className="mr-auto flex items-center gap-2 px-4 py-3 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/50 rounded-xl transition-all"
        >
          <ExternalLink className="h-4 w-4" />
          OpenAPI JSON
        </a>
      </div>

      {/* Iframe Container */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-cyan-500/5" />
        <div className="relative" style={{ height: "75vh" }}>
          {tab === "swagger" ? (
            <iframe src="/ops/api/docs" className="w-full h-full rounded-xl" title="Swagger UI" />
          ) : (
            <iframe src="/ops/api/redoc" className="w-full h-full rounded-xl" title="ReDoc" />
          )}
        </div>
      </div>
    </div>
  )
}
// ============================================================================
// 4. STORAGE MANAGEMENT - إدارة التخزين (app/ops/storage/page.tsx)
// ============================================================================

;("use client")

import { useState } from "react"
import { Database, FolderOpen, Upload, Download, ExternalLink, RefreshCw } from "lucide-react"

export function StoragePage() {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-l from-indigo-400 to-cyan-400 bg-clip-text text-transparent mb-2">
          إدارة التخزين (MinIO)
        </h2>
        <p className="text-slate-400">إدارة الملفات والكائنات المخزنة في MinIO</p>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setRefreshKey((prev) => prev + 1)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-l from-indigo-500 to-cyan-500 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all"
        >
          <RefreshCw className="h-4 w-4" />
          تحديث
        </button>

        <a
          href="/ops/minio-console"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/50 rounded-xl transition-all"
        >
          <ExternalLink className="h-4 w-4" />
          فتح في نافذة جديدة
        </a>

        <div className="mr-auto flex items-center gap-4 px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-indigo-400" />
            <span className="text-sm text-slate-300">
              <span className="font-semibold text-white">5</span> Buckets
            </span>
          </div>
          <div className="w-px h-4 bg-slate-700" />
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-cyan-400" />
            <span className="text-sm text-slate-300">
              <span className="font-semibold text-white">8.7 GB</span> مستخدم
            </span>
          </div>
        </div>
      </div>

      {/* Storage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
              <FolderOpen className="h-5 w-5 text-indigo-400" />
            </div>
            <span className="text-slate-400 text-sm">إجمالي الكائنات</span>
          </div>
          <p className="text-3xl font-bold text-white">2,341</p>
        </div>

        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
              <Upload className="h-5 w-5 text-cyan-400" />
            </div>
            <span className="text-slate-400 text-sm">رفع اليوم</span>
          </div>
          <p className="text-3xl font-bold text-white">127</p>
        </div>

        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <Download className="h-5 w-5 text-emerald-400" />
            </div>
            <span className="text-slate-400 text-sm">تحميل اليوم</span>
          </div>
          <p className="text-3xl font-bold text-white">543</p>
        </div>
      </div>

      {/* MinIO Console Iframe */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-cyan-500/5" />
        <div className="relative" style={{ height: "70vh" }}>
          <iframe
            key={refreshKey}
            src="/ops/minio-console"
            className="w-full h-full rounded-xl"
            title="MinIO Console"
          />
        </div>
      </div>

      {/* Info Note */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <p className="text-sm text-blue-400">
          💡 <strong>ملاحظة:</strong> يمكنك استخدام واجهة MinIO Console أعلاه لإدارة الملفات والـ Buckets بشكل كامل.
          للوصول المباشر، استخدم الرابط في الأعلى.
        </p>
      </div>
    </div>
  )
}
// ============================================================================
// 5. AI TASKS MONITORING - مراقبة مهام AI (app/ops/ai/page.tsx)
// ============================================================================

;("use client")

import { useEffect, useState } from "react"
import { Cpu, Activity, Clock, CheckCircle, XCircle, Loader2, TrendingUp, Zap } from "lucide-react"

type EventMsg = {
  type: string
  ts: string
  payload: any
}

type JobStatus = "pending" | "processing" | "completed" | "failed"

type Job = {
  id: string
  type: string
  status: JobStatus
  progress: number
  created: string
  duration?: string
}

export function AiPage() {
  const [events, setEvents] = useState<EventMsg[]>([])
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: "job-001",
      type: "document_analysis",
      status: "processing",
      progress: 65,
      created: "2025-01-29 14:23:15",
      duration: "2m 34s",
    },
    {
      id: "job-002",
      type: "compliance_check",
      status: "completed",
      progress: 100,
      created: "2025-01-29 14:20:08",
      duration: "1m 12s",
    },
    {
      id: "job-003",
      type: "risk_assessment",
      status: "pending",
      progress: 0,
      created: "2025-01-29 14:25:42",
    },
  ])

  useEffect(() => {
    const es = new EventSource("/ops/api/ops/events")
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        if (data.type === "ai_job_event") {
          setEvents((prev) => [data, ...prev].slice(0, 100))
        }
      } catch {}
    }
    es.onerror = () => {
      console.log("[v0] SSE connection error for AI events")
    }

    return () => es.close()
  }, [])

  const getStatusIcon = (status: JobStatus) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-400" />
      case "processing":
        return <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
      case "completed":
        return <CheckCircle className="h-5 w-5 text-emerald-400" />
      case "failed":
        return <XCircle className="h-5 w-5 text-red-400" />
    }
  }

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
      case "processing":
        return "bg-blue-500/10 border-blue-500/30 text-blue-400"
      case "completed":
        return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
      case "failed":
        return "bg-red-500/10 border-red-500/30 text-red-400"
    }
  }

  const stats = [
    { label: "المهام النشطة", value: "12", icon: Activity, color: "indigo" },
    { label: "في الانتظار", value: "3", icon: Clock, color: "orange" },
    { label: "مكتملة اليوم", value: "45", icon: CheckCircle, color: "emerald" },
    { label: "معدل النجاح", value: "98.5%", icon: TrendingUp, color: "cyan" },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-l from-indigo-400 to-cyan-400 bg-clip-text text-transparent mb-2">
          مهام الذكاء الاصطناعي
        </h2>
        <p className="text-slate-400">مراقبة وإدارة مهام AI Worker في الوقت الفعلي</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <div
              key={idx}
              className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-5 hover:border-indigo-500/30 transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 bg-${stat.color}-500/10 border border-${stat.color}-500/20 rounded-lg`}>
                  <Icon className={`h-5 w-5 text-${stat.color}-400`} />
                </div>
                <span className="text-slate-400 text-sm">{stat.label}</span>
              </div>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </div>
          )
        })}
      </div>

      {/* Jobs Queue */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">قائمة المهام</h3>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
            <Zap className="h-4 w-4 text-indigo-400" />
            <span className="text-xs text-indigo-400 font-medium">{jobs.length} مهمة</span>
          </div>
        </div>

        <div className="space-y-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-5 hover:border-indigo-500/30 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(job.status)}
                  <div>
                    <h4 className="text-white font-semibold">{job.id}</h4>
                    <p className="text-slate-400 text-sm">{job.type}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${getStatusColor(job.status)}`}>
                  {job.status}
                </span>
              </div>

              {job.status === "processing" && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-400">التقدم</span>
                    <span className="text-white font-medium">{job.progress}%</span>
                  </div>
                  <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-l from-indigo-500 to-cyan-500 transition-all duration-500"
                      style={{ width: `${job.progress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 text-sm text-slate-400">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{job.created}</span>
                </div>
                {job.duration && (
                  <>
                    <div className="w-px h-4 bg-slate-700" />
                    <span>المدة: {job.duration}</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Events */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">الأحداث المباشرة</h3>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs text-emerald-400 font-medium">SSE متصل</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl overflow-hidden">
          {events.length === 0 ? (
            <div className="p-8 text-center">
              <Cpu className="h-12 w-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">في انتظار أحداث AI Worker...</p>
              <p className="text-slate-500 text-sm mt-1">سيتم عرض الأحداث الجديدة هنا تلقائياً</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700/50 max-h-96 overflow-y-auto">
              {events.map((event, idx) => (
                <div key={idx} className="p-4 hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                      <Activity className="h-4 w-4 text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white">{event.type}</span>
                        <span className="text-xs text-slate-500">{event.ts}</span>
                      </div>
                      <pre className="text-xs text-slate-400 whitespace-pre-wrap overflow-x-auto">
                        {JSON.stringify(event.payload, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
// ============================================================================
// 6. SETTINGS - الإعدادات (app/ops/settings/page.tsx)
// ============================================================================

;("use client")
import { Database, Server, Key, Globe, Shield, Bell } from "lucide-react"

export function SettingsPage() {
  const settings = [
    {
      category: "قاعدة البيانات",
      icon: Database,
      color: "indigo",
      items: [
        { label: "نوع قاعدة البيانات", value: "PostgreSQL 15.2" },
        { label: "المضيف", value: "postgres:5432" },
        { label: "اسم القاعدة", value: "auditdb" },
        { label: "الاتصالات النشطة", value: "24 / 100" },
      ],
    },
    {
      category: "Redis",
      icon: Server,
      color: "orange",
      items: [
        { label: "الإصدار", value: "Redis 7.0.8" },
        { label: "المضيف", value: "redis:6379" },
        { label: "استخدام الذاكرة", value: "128 MB / 512 MB" },
        { label: "عدد المفاتيح", value: "1,234" },
      ],
    },
    {
      category: "MinIO",
      icon: Database,
      color: "cyan",
      items: [
        { label: "نقطة النهاية", value: "http://minio:9000" },
        { label: "Console", value: "http://minio:9001" },
        { label: "عدد الـ Buckets", value: "5" },
        { label: "المساحة المستخدمة", value: "8.7 GB" },
      ],
    },
    {
      category: "API Server",
      icon: Globe,
      color: "emerald",
      items: [
        { label: "الإصدار", value: "FastAPI 0.109.0" },
        { label: "البيئة", value: "Development" },
        { label: "المنفذ", value: "8000" },
        { label: "وقت التشغيل", value: "3d 14h 23m" },
      ],
    },
    {
      category: "الأمان",
      icon: Shield,
      color: "orange",
      items: [
        { label: "CORS", value: "مفعّل" },
        { label: "HTTPS", value: "غير مفعّل (محلي)" },
        { label: "JWT Expiry", value: "24 ساعة" },
        { label: "Rate Limiting", value: "100 req/min" },
      ],
    },
    {
      category: "الإشعارات",
      icon: Bell,
      color: "cyan",
      items: [
        { label: "Email", value: "مفعّل" },
        { label: "Webhooks", value: "مفعّل" },
        { label: "SSE", value: "متصل" },
        { label: "Alerts", value: "3 نشط" },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-l from-indigo-400 to-cyan-400 bg-clip-text text-transparent mb-2">
          إعدادات النظام
        </h2>
        <p className="text-slate-400">عرض إعدادات وتكوينات البنية التحتية (للقراءة فقط)</p>
      </div>

      {/* Info Banner */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-blue-400 mt-0.5" />
          <div>
            <p className="text-sm text-blue-400 font-medium mb-1">وضع القراءة فقط</p>
            <p className="text-xs text-blue-400/80">
              هذه الصفحة تعرض الإعدادات الحالية للنظام. لتعديل الإعدادات، يرجى تحديث ملفات البيئة (.env) وإعادة تشغيل
              الخدمات.
            </p>
          </div>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {settings.map((section, idx) => {
          const Icon = section.icon
          return (
            <div
              key={idx}
              className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-6 hover:border-indigo-500/30 transition-all"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className={`p-3 bg-${section.color}-500/10 border border-${section.color}-500/20 rounded-lg`}>
                  <Icon className={`h-6 w-6 text-${section.color}-400`} />
                </div>
                <h3 className="text-xl font-semibold text-white">{section.category}</h3>
              </div>

              <div className="space-y-3">
                {section.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 border-b border-slate-700/30 last:border-0"
                  >
                    <span className="text-sm text-slate-400">{item.label}</span>
                    <span className="text-sm text-white font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Environment Variables */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">متغيرات البيئة</h3>
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-6">
          <div className="space-y-3">
            {[
              { key: "NEXT_PUBLIC_API_BASE", value: "http://localhost:8000" },
              { key: "NEXT_PUBLIC_OPS_BASE", value: "/ops" },
              { key: "DATABASE_URL", value: "postgresql://***:***@postgres:5432/auditdb" },
              { key: "REDIS_URL", value: "redis://redis:6379/0" },
              { key: "S3_ENDPOINT", value: "http://minio:9000" },
              { key: "S3_ACCESS_KEY", value: "***" },
            ].map((env, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between py-2 border-b border-slate-700/30 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-mono text-slate-300">{env.key}</span>
                </div>
                <span className="text-sm font-mono text-slate-400">{env.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
// ============================================================================
// 7. LOGS & ALERTS - السجلات والتنبيهات (app/ops/logs/page.tsx)
// ============================================================================

;("use client")

import { useState } from "react"
import { FileText, AlertCircle, Info, CheckCircle, XCircle, Filter, Download, RefreshCw } from "lucide-react"

type LogLevel = "info" | "warning" | "error" | "success"

type LogEntry = {
  id: string
  timestamp: string
  level: LogLevel
  service: string
  message: string
  details?: string
}

export function LogsPage() {
  const [selectedLevel, setSelectedLevel] = useState<LogLevel | "all">("all")

  const logs: LogEntry[] = [
    {
      id: "1",
      timestamp: "2025-01-29 14:32:15",
      level: "info",
      service: "API",
      message: "تم بدء تشغيل الخادم بنجاح",
      details: "Server started on port 8000",
    },
    {
      id: "2",
      timestamp: "2025-01-29 14:32:18",
      level: "success",
      service: "Database",
      message: "تم الاتصال بقاعدة البيانات",
      details: "Connected to PostgreSQL at postgres:5432",
    },
    {
      id: "3",
      timestamp: "2025-01-29 14:32:20",
      level: "success",
      service: "Redis",
      message: "تم الاتصال بـ Redis",
      details: "Connected to Redis at redis:6379",
    },
    {
      id: "4",
      timestamp: "2025-01-29 14:35:42",
      level: "warning",
      service: "MinIO",
      message: "استخدام مساحة التخزين مرتفع",
      details: "Storage usage: 8.7 GB / 10 GB (87%)",
    },
    {
      id: "5",
      timestamp: "2025-01-29 14:38:11",
      level: "error",
      service: "AI Worker",
      message: "فشل في معالجة المهمة job-045",
      details: "Error: Timeout after 300 seconds",
    },
    {
      id: "6",
      timestamp: "2025-01-29 14:40:23",
      level: "info",
      service: "API",
      message: "طلب جديد: POST /api/documents",
      details: "User: admin@audit.com, IP: 192.168.1.100",
    },
  ]

  const filteredLogs = selectedLevel === "all" ? logs : logs.filter((log) => log.level === selectedLevel)

  const getLevelIcon = (level: LogLevel) => {
    switch (level) {
      case "info":
        return <Info className="h-5 w-5 text-cyan-400" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-orange-400" />
      case "error":
        return <XCircle className="h-5 w-5 text-rose-400" />
      case "success":
        return <CheckCircle className="h-5 w-5 text-emerald-400" />
    }
  }

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case "info":
        return "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
      case "warning":
        return "bg-orange-500/10 border-orange-500/30 text-orange-400"
      case "error":
        return "bg-rose-500/10 border-rose-500/30 text-rose-400"
      case "success":
        return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
    }
  }

  const alerts = [
    { level: "warning", count: 3, label: "تحذيرات" },
    { level: "error", count: 1, label: "أخطاء" },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-l from-indigo-400 to-cyan-400 bg-clip-text text-transparent mb-2">
          السجلات والتنبيهات
        </h2>
        <p className="text-slate-400">عرض سجلات النظام والتنبيهات الحديثة</p>
      </div>

      {/* Alerts Banner */}
      {alerts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alerts.map((alert, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border ${
                alert.level === "warning"
                  ? "bg-orange-500/10 border-orange-500/30"
                  : "bg-rose-500/10 border-rose-500/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <AlertCircle className={`h-6 w-6 ${alert.level === "warning" ? "text-orange-400" : "text-rose-400"}`} />
                <div>
                  <p className={`font-semibold ${alert.level === "warning" ? "text-orange-400" : "text-rose-400"}`}>
                    {alert.count} {alert.label}
                  </p>
                  <p className="text-sm text-slate-400">تتطلب انتباهك</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-slate-400" />
          <span className="text-sm text-slate-400">تصفية:</span>
        </div>

        {(["all", "info", "success", "warning", "error"] as const).map((level) => (
          <button
            key={level}
            onClick={() => setSelectedLevel(level)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedLevel === level
                ? "bg-gradient-to-l from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/30"
                : "bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-700/50"
            }`}
          >
            {level === "all"
              ? "الكل"
              : level === "info"
                ? "معلومات"
                : level === "success"
                  ? "نجاح"
                  : level === "warning"
                    ? "تحذيرات"
                    : "أخطاء"}
          </button>
        ))}

        <div className="mr-auto flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/50 rounded-lg transition-all">
            <RefreshCw className="h-4 w-4" />
            تحديث
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/50 rounded-lg transition-all">
            <Download className="h-4 w-4" />
            تصدير
          </button>
        </div>
      </div>

      {/* Logs List */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="divide-y divide-slate-700/50">
          {filteredLogs.map((log) => (
            <div key={log.id} className="p-5 hover:bg-slate-800/30 transition-colors">
              <div className="flex items-start gap-4">
                <div className="mt-1">{getLevelIcon(log.level)}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getLevelColor(log.level)}`}>
                      {log.level}
                    </span>
                    <span className="px-2 py-1 bg-slate-700/50 rounded-md text-xs text-slate-300">{log.service}</span>
                    <span className="text-xs text-slate-500">{log.timestamp}</span>
                  </div>

                  <p className="text-white font-medium mb-1">{log.message}</p>
                  {log.details && <p className="text-sm text-slate-400 font-mono">{log.details}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredLogs.length === 0 && (
        <div className="p-8 text-center bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl">
          <FileText className="h-12 w-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">لا توجد سجلات مطابقة للفلتر المحدد</p>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// 8. NEXT.JS CONFIGURATION - إعدادات next.config.mjs
// ============================================================================

/*
أضف هذا الكود إلى ملف next.config.mjs في مشروعك:

const nextConfig = {
  async rewrites() {
    return [
      // تمرير API
      {
        source: '/ops/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_BASE 
          ? `${process.env.NEXT_PUBLIC_API_BASE}/:path*` 
          : 'http://localhost:8000/:path*',
      },
      // تمرير MinIO API
      {
        source: '/ops/minio/:path*',
        destination: process.env.S3_ENDPOINT || 'http://localhost:9000/:path*',
      },
      // تمرير MinIO Console
      {
        source: '/ops/minio-console/:path*',
        destination: 'http://localhost:9001/:path*',
      },
    ]
  },
}

export default nextConfig
*/

// ============================================================================
// 9. INSTALLATION GUIDE - دليل التثبيت
// ============================================================================

/*
📦 خطوات التثبيت:

1. إنشاء المجلدات:
   mkdir -p app/ops/api app/ops/storage app/ops/ai app/ops/settings app/ops/logs

2. نسخ الملفات:
   - انسخ كود OpsLayout إلى: app/ops/layout.tsx
   - انسخ كود OpsOverview إلى: app/ops/page.tsx
   - انسخ كود ApiExplorer إلى: app/ops/api/page.tsx
   - انسخ كود StoragePage إلى: app/ops/storage/page.tsx
   - انسخ كود AiPage إلى: app/ops/ai/page.tsx
   - انسخ كود SettingsPage إلى: app/ops/settings/page.tsx
   - انسخ كود LogsPage إلى: app/ops/logs/page.tsx

3. تحديث next.config.mjs:
   - أضف إعدادات rewrites كما هو موضح في القسم 8

4. إضافة متغيرات البيئة (.env.local):
   NEXT_PUBLIC_API_BASE=http://localhost:8000
   S3_ENDPOINT=http://localhost:9000

5. تشغيل المشروع:
   npm run dev

6. الوصول إلى البوابة:
   http://localhost:3000/ops

✅ تم! البوابة جاهزة للاستخدام
*/
