"use client"

import { useEffect, useState } from "react"
import { List, AlertCircle } from "lucide-react"

type LogEntry = {
	ts: string
	level: string
	message: string
}

export default function OpsLogsPage() {
	const [logs, setLogs] = useState<LogEntry[]>([])
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		fetch("/ops/api/ops/logs")
			.then((r) => r.json())
			.then((data) => {
				setLogs(data)
				setLoading(false)
			})
			.catch(() => {
				setError("تعذر تحميل سجل الأحداث")
				setLoading(false)
			})
	}, [])

	if (loading) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="text-center space-y-4">
					<div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
					<p className="text-slate-300">جاري تحميل سجل الأحداث...</p>
				</div>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-bold bg-gradient-to-l from-indigo-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
					سجل الأحداث
				</h2>
				<p className="text-slate-300">عرض أحدث الأحداث والرسائل</p>
			</div>

			{error && (
				<div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3">
					<AlertCircle className="h-5 w-5 text-rose-400" />
					<span className="text-rose-300">{error}</span>
				</div>
			)}

			<div className="divide-y divide-slate-700/50 rounded-xl overflow-hidden border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-900/60">
				{logs.length === 0 ? (
					<div className="p-8 text-center">
						<List className="h-12 w-12 text-slate-600 mx-auto mb-3" />
						<p className="text-slate-300">لا توجد أحداث بعد</p>
						<p className="text-slate-500 text-sm mt-1">سيتم عرض الأحداث الجديدة هنا تلقائياً</p>
					</div>
				) : (
					logs.map((log, idx) => (
						<div key={idx} className="flex items-center gap-4 p-4 hover:bg-slate-800/30 transition-colors">
							<span className={`px-2 py-1 rounded-md text-xs font-bold ${log.level === "error" ? "bg-rose-500/10 text-rose-300 border border-rose-500/30" : log.level === "warn" ? "bg-orange-500/10 text-orange-300 border border-orange-500/30" : "bg-indigo-500/10 text-indigo-300 border border-indigo-500/30"}`}>
								{log.level}
							</span>
							<span className="text-slate-200 font-medium">{log.message}</span>
							<span className="text-slate-400 text-sm ml-auto">{log.ts}</span>
						</div>
					))
				)}
			</div>
		</div>
	)
}
// ...existing code from EXPORT_OPS_CONSOLE_COMPLETE_FINAL (1).tsx section 7 (LOGS & ALERTS)...