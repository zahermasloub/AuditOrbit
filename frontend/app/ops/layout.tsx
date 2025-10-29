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

								<Link
									href="/dashboard"
									className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/20 border border-indigo-500/40 rounded-lg text-indigo-100 hover:bg-indigo-500/30 hover:border-indigo-500/60 transition-colors"
								>
									<LayoutGrid className="h-4 w-4" />
									<span className="text-sm font-medium">لوحة التحكم</span>
								</Link>

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