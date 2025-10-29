"use client"

import { useEffect, useMemo, useState } from "react"
import type { LucideIcon } from "lucide-react"
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
import { formatDistanceToNow } from "date-fns"
import { ar } from "date-fns/locale"

const COLOR_VARIANTS = {
    indigo: {
        surface: "bg-indigo-500/10 border-indigo-500/30",
        icon: "text-indigo-400",
    },
    cyan: {
        surface: "bg-cyan-500/10 border-cyan-500/30",
        icon: "text-cyan-400",
    },
    orange: {
        surface: "bg-orange-500/10 border-orange-500/30",
        icon: "text-orange-400",
    },
    emerald: {
        surface: "bg-emerald-500/10 border-emerald-500/30",
        icon: "text-emerald-400",
    },
} as const

const SYSTEM_METRICS = [
    { label: "استخدام CPU", value: "42%", trend: "up" as const, change: "+5%", icon: Cpu, variant: "indigo" as const },
    { label: "استخدام الذاكرة", value: "68%", trend: "down" as const, change: "-3%", icon: Activity, variant: "cyan" as const },
    { label: "مساحة التخزين", value: "11.1 GB", trend: "up" as const, change: "+1.2 GB", icon: HardDrive, variant: "orange" as const },
    { label: "الطلبات/دقيقة", value: "1,234", trend: "up" as const, change: "+12%", icon: TrendingUp, variant: "emerald" as const },
] as const

const SERVICE_BLUEPRINT = [
    {
        name: "API Server",
        statusKey: "db" as const,
        icon: Server,
        variant: "indigo" as const,
        metrics: { uptime: "99.9%", requests: "1.2M", latency: "45ms" },
    },
    {
        name: "Database",
        statusKey: "db" as const,
        icon: Database,
        variant: "cyan" as const,
        metrics: { connections: "24", queries: "8.5K", size: "2.4 GB" },
    },
    {
        name: "Redis Cache",
        statusKey: "redis" as const,
        icon: Zap,
        variant: "orange" as const,
        metrics: { keys: "1,234", memory: "128 MB", hits: "94%" },
    },
    {
        name: "MinIO Storage",
        statusKey: "minio" as const,
        icon: HardDrive,
        variant: "indigo" as const,
        metrics: { buckets: "5", objects: "2,341", size: "8.7 GB" },
    },
    {
        name: "AI Worker",
        statusKey: "ai_worker" as const,
        icon: Cpu,
        variant: "cyan" as const,
        metrics: { jobs: "12", queue: "3", processed: "1,456" },
    },
    {
        name: "Network",
        statusKey: null,
        icon: Wifi,
        variant: "emerald" as const,
        metrics: { bandwidth: "125 Mbps", packets: "45K", errors: "0" },
    },
] as const

type ColorVariant = keyof typeof COLOR_VARIANTS

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
    payload: unknown
}

type ServiceCard = {
    name: string
    status: "online" | "offline"
    icon: LucideIcon
    variant: ColorVariant
    metrics: Record<string, string>
}

export default function OpsOverview() {
    const [health, setHealth] = useState<HealthData | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [events, setEvents] = useState<EventMsg[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let isMounted = true
        const controller = new AbortController()

        const loadHealth = async () => {
            try {
                const response = await fetch("/ops/api/ops/healthz-aggregate", { signal: controller.signal })
                if (!response.ok) {
                    throw new Error("تعذر تحميل بيانات الصحة")
                }
                const data = (await response.json()) as HealthData
                if (!isMounted) return
                setHealth(data)
                setError(null)
            } catch (err) {
                if (!isMounted) return
                if (err instanceof DOMException && err.name === "AbortError") {
                    return
                }
                const message = err instanceof Error ? err.message : "تعذر الاتصال بالـ API"
                setError(message)
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        loadHealth().catch((err) => console.error("Failed to load health", err))

        const eventSource = new EventSource("/ops/api/ops/events")
        eventSource.onmessage = (event) => {
            try {
                const payload = JSON.parse(event.data) as EventMsg
                setEvents((prev) => [payload, ...prev].slice(0, 50))
            } catch (err) {
                console.error("فشل تحليل حدث SSE", err)
            }
        }
        eventSource.onerror = () => {
            console.warn("انقطع اتصال SSE، سيحاول المتصفح إعادة الاتصال تلقائياً")
        }

        return () => {
            isMounted = false
            controller.abort()
            eventSource.close()
        }
    }, [])

    const services = useMemo<ServiceCard[]>(() => {
        const details = health?.details
        return SERVICE_BLUEPRINT.map((template) => ({
            ...template,
            status:
                template.statusKey && details
                    ? details[template.statusKey] === "ok"
                        ? "online"
                        : "offline"
                    : "online",
        }))
    }, [health])

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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {SYSTEM_METRICS.map((metric, idx) => {
                    const Icon = metric.icon
                    const isUp = metric.trend === "up"
                    const variant = COLOR_VARIANTS[metric.variant]

                    return (
                        <div
                            key={idx}
                            className="relative group overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/50 rounded-xl p-5 hover:border-indigo-500/40 transition-all hover:shadow-lg hover:shadow-indigo-500/10"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="relative">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 ${variant.surface} rounded-lg shadow-sm`}>
                                        <Icon className={`h-6 w-6 ${variant.icon}`} />
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

            <div>
                <h3 className="text-xl font-semibold text-white mb-4">حالة الخدمات</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {services.map((service, idx) => {
                        const Icon = service.icon
                        const isOnline = service.status === "online"
                        const variant = COLOR_VARIANTS[service.variant]

                        return (
                            <div
                                key={idx}
                                className="relative group overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/50 rounded-xl p-5 hover:border-indigo-500/40 transition-all hover:shadow-lg hover:shadow-indigo-500/10"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="relative">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-3 ${variant.surface} rounded-lg shadow-sm`}>
                                            <Icon className={`h-6 w-6 ${variant.icon}`} />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`w-2 h-2 rounded-full ${
                                                    isOnline
                                                        ? "bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50"
                                                        : "bg-rose-400"
                                                }`}
                                            />
                                            <span className={`text-xs font-medium ${isOnline ? "text-emerald-300" : "text-rose-300"}`}>
                                                {isOnline ? "نشط" : "غير متصل"}
                                            </span>
                                        </div>
                                    </div>

                                    <h4 className="text-white font-semibold mb-3">{service.name}</h4>

                                    <div className="space-y-2">
                                        {Object.entries(service.metrics).map(([key, value]) => (
                                            <div key={key} className="flex items-center justify-between text-sm">
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
                            {events.map((event) => (
                                <div key={`${event.type}-${event.ts}`} className="p-4 hover:bg-slate-800/30 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                                            <Activity className="h-4 w-4 text-indigo-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-medium text-white">{event.type}</span>
                                                <span className="text-xs text-slate-500">
                                                    {formatDistanceToNow(new Date(event.ts), { addSuffix: true, locale: ar })}
                                                </span>
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
