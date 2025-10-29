"use client"

import { useEffect, useState } from "react"
import { Cpu, Zap, AlertCircle } from "lucide-react"

type AIStatus = {
	status: string
	jobs: Array<{ id: string; status: string; type: string; started: string; finished?: string }>
}
export default function AIWorkerPage() {
	const [ai, setAI] = useState<AIStatus | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		fetch("/ops/api/ops/ai-status")
			.then((r) => r.json())
			.then((data) => {
				setAI(data)
				setLoading(false)
			})
			.catch(() => {
				setError("تعذر الاتصال بخدمة الذكاء الاصطناعي")
				setLoading(false)
	  })
  }, [])

	if (loading) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="text-center space-y-4">
					<div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto" />
					<p className="text-slate-300">جاري تحميل بيانات الذكاء الاصطناعي...</p>
				</div>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-bold bg-gradient-to-l from-orange-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
					إدارة الذكاء الاصطناعي
				</h2>
				<p className="text-slate-300">تفاصيل المهام وحالة العامل</p>
	</div>

	{error && (
				<div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3">
					<AlertCircle className="h-5 w-5 text-rose-400" />
					<span className="text-rose-300">{error}</span>
				</div>
			)}

			{ai && (
				<div className="space-y-4">
					<div className="flex items-center gap-3">
						<Cpu className="h-6 w-6 text-orange-400" />
						<span className="text-lg font-semibold text-white">الحالة: </span>
						<span className={`px-2 py-1 rounded-md text-xs font-medium ${ai.status === "online" ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30" : "bg-rose-500/10 text-rose-300 border border-rose-500/30"}`}>
							{ai.status === "online" ? "نشط" : "غير متصل"}
						</span>
					</div>

					<div>
						<h3 className="text-lg font-semibold text-white mb-2">المهام الأخيرة</h3>
						<div className="divide-y divide-slate-700/50 rounded-xl overflow-hidden border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-900/60">
							{ai.jobs.map((job, idx) => (
								<div key={idx} className="flex items-center gap-4 p-4 hover:bg-slate-800/30 transition-colors">
									<Zap className={`h-5 w-5 ${job.status === "done" ? "text-emerald-300" : job.status === "error" ? "text-rose-300" : "text-orange-300"}`} />
									<span className="text-slate-200 font-medium">{job.type}</span>
									<span className={`text-xs font-bold px-2 py-1 rounded-md ${job.status === "done" ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30" : job.status === "error" ? "bg-rose-500/10 text-rose-300 border border-rose-500/30" : "bg-orange-500/10 text-orange-300 border border-orange-500/30"}`}>
										{job.status === "done" ? "منجز" : job.status === "error" ? "خطأ" : "قيد التنفيذ"}
									</span>
									<span className="text-slate-400 text-sm">{job.started}</span>
									{job.finished && <span className="text-slate-400 text-sm">{job.finished}</span>}
								</div>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
// ...existing code from EXPORT_OPS_CONSOLE_COMPLETE_FINAL (1).tsx section 5 (AI TASKS MONITORING)...