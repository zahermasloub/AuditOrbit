"use client"

import { useEffect, useState } from "react"
import { Server, ArrowRight, AlertCircle } from "lucide-react"

type ApiStatus = {
	status: string
	version: string
	docs_url: string
	endpoints: Array<{ path: string; method: string; description: string }>
}

export default function ApiExplorer() {
	const [api, setApi] = useState<ApiStatus | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		fetch("/ops/api/ops/api-status")
			.then((r) => r.json())
			.then((data) => {
				setApi(data)
				setLoading(false)
			})
			.catch(() => {
				setError("تعذر الاتصال بخدمة API")
				setLoading(false)
			})
	}, [])

	if (loading) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="text-center space-y-4">
					<div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto" />
					<p className="text-slate-300">جاري تحميل بيانات API...</p>
				</div>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-bold bg-gradient-to-l from-cyan-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent mb-2">
					مستكشف واجهات API
				</h2>
				<p className="text-slate-300">تفاصيل نقاط النهاية ونسخة الخدمة</p>
			</div>

			{error && (
				<div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3">
					<AlertCircle className="h-5 w-5 text-rose-400" />
					<span className="text-rose-300">{error}</span>
				</div>
			)}

			{api && (
				<div className="space-y-4">
					<div className="flex items-center gap-3">
						<Server className="h-6 w-6 text-cyan-400" />
						<span className="text-lg font-semibold text-white">الحالة: </span>
						<span className={`px-2 py-1 rounded-md text-xs font-medium ${api.status === "online" ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30" : "bg-rose-500/10 text-rose-300 border border-rose-500/30"}`}>
							{api.status === "online" ? "نشط" : "غير متصل"}
						</span>
						<span className="text-slate-400 ml-4">الإصدار: {api.version}</span>
						<a
							href={api.docs_url}
							target="_blank"
							rel="noopener noreferrer"
							className="ml-auto px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-300 text-xs font-medium hover:bg-cyan-500/20 transition"
						>
							توثيق API
						</a>
					</div>

					<div>
						<h3 className="text-lg font-semibold text-white mb-2">نقاط النهاية</h3>
						<div className="divide-y divide-slate-700/50 rounded-xl overflow-hidden border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-900/60">
							{api.endpoints.map((ep, idx) => (
								<div key={idx} className="flex items-center gap-4 p-4 hover:bg-slate-800/30 transition-colors">
									<span className="px-2 py-1 rounded-md text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
										{ep.method}
									</span>
									<span className="text-slate-200 font-medium">{ep.path}</span>
									<ArrowRight className="h-4 w-4 text-slate-500" />
									<span className="text-slate-400 text-sm">{ep.description}</span>
								</div>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	)
}