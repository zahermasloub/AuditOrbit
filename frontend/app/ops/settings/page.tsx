"use client"

import { useEffect, useState } from "react"
import { Settings, AlertCircle } from "lucide-react"

type SettingsData = {
	version: string
	env: string
	config: Record<string, string>
}

export default function OpsSettingsPage() {
	const [settings, setSettings] = useState<SettingsData | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		fetch("/ops/api/ops/settings")
			.then((r) => r.json())
			.then((data) => {
				setSettings(data)
				setLoading(false)
			})
			.catch(() => {
				setError("تعذر تحميل الإعدادات")
				setLoading(false)
			})
	}, [])

	if (loading) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="text-center space-y-4">
					<div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
					<p className="text-slate-300">جاري تحميل الإعدادات...</p>
				</div>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-bold bg-gradient-to-l from-indigo-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
					إعدادات النظام
				</h2>
				<p className="text-slate-300">تفاصيل الإعدادات والبيئة</p>
			</div>

			{error && (
				<div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3">
					<AlertCircle className="h-5 w-5 text-rose-400" />
					<span className="text-rose-300">{error}</span>
				</div>
			)}

			{settings && (
				<div className="space-y-4">
					<div className="flex items-center gap-3">
						<Settings className="h-6 w-6 text-indigo-400" />
						<span className="text-lg font-semibold text-white">الإصدار: {settings.version}</span>
						<span className="text-slate-400 ml-4">البيئة: {settings.env}</span>
					</div>

					<div>
						<h3 className="text-lg font-semibold text-white mb-2">الإعدادات</h3>
						<div className="divide-y divide-slate-700/50 rounded-xl overflow-hidden border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-900/60">
							{Object.entries(settings.config).map(([key, value], idx) => (
								<div key={idx} className="flex items-center gap-4 p-4 hover:bg-slate-800/30 transition-colors">
									<span className="text-slate-200 font-medium">{key}</span>
									<span className="text-slate-400 text-sm">{value}</span>
								</div>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	)
}