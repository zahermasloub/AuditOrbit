// ...existing code from EXPORT_OPS_CONSOLE_COMPLETE_FINAL (1).tsx section 4 (STORAGE MANAGEMENT)...
"use client"

import { useEffect, useState } from "react"
import { HardDrive, FolderOpen, FileText, AlertCircle } from "lucide-react"

type StorageStatus = {
	status: string
	buckets: Array<{ name: string; objects: number; size: string }>
}

export default function StoragePage() {
	const [storage, setStorage] = useState<StorageStatus | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		fetch("/ops/api/ops/storage-status")
			.then((r) => r.json())
			.then((data) => {
				setStorage(data)
				setLoading(false)
			})
			.catch(() => {
				setError("تعذر الاتصال بخدمة التخزين")
				setLoading(false)
			})
	}, [])

	if (loading) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="text-center space-y-4">
					<div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
					<p className="text-slate-300">جاري تحميل بيانات التخزين...</p>
				</div>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-bold bg-gradient-to-l from-indigo-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
					إدارة التخزين
				</h2>
				<p className="text-slate-300">تفاصيل الحاويات والملفات المخزنة</p>
			</div>

			{error && (
				<div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3">
					<AlertCircle className="h-5 w-5 text-rose-400" />
					<span className="text-rose-300">{error}</span>
				</div>
			)}

			{storage && (
				<div className="space-y-4">
					<div className="flex items-center gap-3">
						<HardDrive className="h-6 w-6 text-indigo-400" />
						<span className="text-lg font-semibold text-white">الحالة: </span>
						<span className={`px-2 py-1 rounded-md text-xs font-medium ${storage.status === "online" ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30" : "bg-rose-500/10 text-rose-300 border border-rose-500/30"}`}>
							{storage.status === "online" ? "نشط" : "غير متصل"}
						</span>
					</div>

					<div>
						<h3 className="text-lg font-semibold text-white mb-2">الحاويات</h3>
						<div className="divide-y divide-slate-700/50 rounded-xl overflow-hidden border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-900/60">
							{storage.buckets.map((bucket, idx) => (
								<div key={idx} className="flex items-center gap-4 p-4 hover:bg-slate-800/30 transition-colors">
									<FolderOpen className="h-5 w-5 text-indigo-300" />
									<span className="text-slate-200 font-medium">{bucket.name}</span>
									<FileText className="h-4 w-4 text-slate-500" />
									<span className="text-slate-400 text-sm">{bucket.objects} ملف</span>
									<span className="text-slate-400 text-sm">{bucket.size}</span>
								</div>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	)
}