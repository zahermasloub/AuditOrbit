"use client"

import { useEffect, useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AlertCircle, Check, Loader2, Plus, RefreshCcw, Shield, Trash2 } from "lucide-react"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { opsClient, type SettingsItem } from "@/lib/ops-client"
import { useOpsSse } from "@/lib/use-sse"
import { cn } from "@/lib/utils"

const settingSchema = z.object({
	key: z.string().min(1, "المفتاح مطلوب"),
	value: z.string().min(1, "القيمة مطلوبة"),
	group: z.string().min(1, "المجموعة مطلوبة"),
	description: z.string().optional(),
	isSecret: z.boolean(),
})

const SETTINGS_QUERY_KEY = ["ops-settings"]

export default function OpsSettingsPage() {
	const queryClient = useQueryClient()
	const { toast } = useToast()

	const [groupFilter, setGroupFilter] = useState<string | null>(null)
	const [searchInput, setSearchInput] = useState("")
	const [searchTerm, setSearchTerm] = useState("")
	const [drafts, setDrafts] = useState<Record<string, Partial<SettingsItem>>>({})
	const [errors, setErrors] = useState<Record<string, string>>({})
	const [activeDelete, setActiveDelete] = useState<{ key: string; reset?: boolean } | null>(null)
	const [isNewDialogOpen, setIsNewDialogOpen] = useState(false)

	useEffect(() => {
		const timer = setTimeout(() => setSearchTerm(searchInput.trim()), 350)
		return () => clearTimeout(timer)
	}, [searchInput])

	const settingsQuery = useQuery({
		queryKey: [...SETTINGS_QUERY_KEY, { groupFilter, searchTerm }],
		queryFn: () => opsClient.listSettings({ group: groupFilter || undefined, q: searchTerm || undefined }),
		staleTime: 10_000,
	})

	useOpsSse(
		() => queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY }),
		{ eventTypes: ["settings"] },
	)

	const settings = settingsQuery.data?.items ?? []
	const groups = useMemo(() => Array.from(new Set(settings.map((item) => item.group))).sort(), [settings])
	const dirtyKeys = Object.keys(drafts)

	const bulkUpdateMutation = useMutation({
		mutationFn: (items: SettingsItem[]) =>
			opsClient.updateSettingsBulk(
				items.map(({ key, value, group, description, isSecret }) => ({ key, value, group, description, isSecret })),
			),
		onSuccess: () => {
			setDrafts({})
			setErrors({})
			queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY })
			toast({ title: "تم حفظ التغييرات", description: "تم تحديث الإعدادات بنجاح." })
		},
		onError: (error: unknown) => {
			const message = error instanceof Error ? error.message : "تعذر حفظ التغييرات"
			toast({ title: "تعذر حفظ التغييرات", description: message, variant: "destructive" })
		},
	})

	const singleUpdateMutation = useMutation({
		mutationFn: (item: SettingsItem) =>
			opsClient.updateSetting(item.key, {
				value: item.value,
				description: item.description,
				group: item.group,
				isSecret: item.isSecret,
			}),
		onSuccess: (_, variables) => {
			setDrafts((prev) => {
				const next = { ...prev }
				delete next[variables.key]
				return next
			})
			setErrors((prev) => {
				const next = { ...prev }
				delete next[variables.key]
				return next
			})
			queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY })
			toast({ title: "تم تحديث الإعداد", description: variables.key })
		},
		onError: (error: unknown, variables) => {
			const message = error instanceof Error ? error.message : "تعذر تحديث الإعداد"
			setErrors((prev) => ({ ...prev, [variables.key]: message }))
		},
	})

	const deleteMutation = useMutation({
		mutationFn: ({ key, reset }: { key: string; reset?: boolean }) => opsClient.deleteSetting(key, { reset }),
		onSuccess: (_, variables) => {
			setActiveDelete(null)
			setDrafts((prev) => {
				const next = { ...prev }
				delete next[variables.key]
				return next
			})
			queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY })
			toast({
				title: variables.reset ? "تمت استعادة القيمة الافتراضية" : "تم حذف الإعداد",
				description: variables.key,
			})
		},
		onError: (error: unknown) => {
			const message = error instanceof Error ? error.message : "تعذر تنفيذ العملية"
			toast({ title: "فشل العملية", description: message, variant: "destructive" })
		},
	})

	const createMutation = useMutation({
		mutationFn: (item: SettingsItem) =>
			opsClient.createSetting({
				key: item.key,
				value: item.value,
				description: item.description,
				group: item.group,
				isSecret: item.isSecret,
				defaultValue: item.defaultValue,
			}),
		onSuccess: () => {
			setIsNewDialogOpen(false)
			queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY })
			toast({ title: "تم إضافة الإعداد", description: "يمكنك الآن التعديل عليه." })
		},
		onError: (error: unknown) => {
			const message = error instanceof Error ? error.message : "تعذر إنشاء الإعداد"
			toast({ title: "فشل إضافة الإعداد", description: message, variant: "destructive" })
		},
	})

	const handleDraftChange = (key: string, changes: Partial<SettingsItem>) => {
		setDrafts((prev) => {
			const currentSetting = settings.find((item) => item.key === key)
			if (!currentSetting) return prev
			const nextDraft = { ...prev[key], ...changes }
			const merged = { ...currentSetting, ...nextDraft }
			const isEqual = settingsEqual(currentSetting, merged)

			if (isEqual) {
				const next = { ...prev }
				delete next[key]
				return next
			}
			return { ...prev, [key]: nextDraft }
		})
	}

	const handleBulkSave = () => {
		const payload: SettingsItem[] = []
		const newErrors: Record<string, string> = {}

		dirtyKeys.forEach((key) => {
			const current = settings.find((item) => item.key === key)
			if (!current) return
			const merged = { ...current, ...drafts[key] }
			const parsed = settingSchema.safeParse(merged)
			if (!parsed.success) {
				newErrors[key] = parsed.error.errors[0]?.message ?? "خطأ في البيانات"
				return
			}
			payload.push(parsed.data)
		})

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors)
			return
		}

		bulkUpdateMutation.mutate(payload)
	}

	const handleSingleSave = (key: string) => {
		const current = settings.find((item) => item.key === key)
		if (!current) return
		const merged = { ...current, ...drafts[key] }
		const parsed = settingSchema.safeParse(merged)
		if (!parsed.success) {
			setErrors((prev) => ({ ...prev, [key]: parsed.error.errors[0]?.message ?? "خطأ في البيانات" }))
			return
		}
		singleUpdateMutation.mutate(parsed.data)
	}

	const handleCreate = (data: z.infer<typeof settingSchema> & { defaultValue?: string | null }) => {
		createMutation.mutate({ ...data, defaultValue: data.defaultValue ?? null, updatedAt: undefined, updatedBy: undefined })
	}

	return (
		<div className="space-y-6">
			<header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div>
					<h1 className="text-2xl font-bold text-white">إدارة إعدادات النظام</h1>
					<p className="text-sm text-slate-400">تحكم كامل بالقيم الخاصة بالمنصة مع توثيق فوري للتغييرات.</p>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="secondary" onClick={() => queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY })} disabled={settingsQuery.isFetching}>
						{settingsQuery.isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />} &nbsp;تحديث
					</Button>
					<Button onClick={() => setIsNewDialogOpen(true)}>
						<Plus className="h-4 w-4" />
						<span className="mr-2">إضافة إعداد</span>
					</Button>
				</div>
			</header>

			<section className="grid gap-4 md:grid-cols-3">
				<Card className="border-slate-800 bg-slate-900/40">
					<CardHeader>
						<CardTitle className="text-sm text-slate-400 flex items-center justify-between">
							<span>عدد الإعدادات</span>
							<Shield className="h-4 w-4 text-indigo-400" />
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-semibold text-white">{settings.length}</p>
					</CardContent>
				</Card>
				<Card className="border-slate-800 bg-slate-900/40">
					<CardHeader>
						<CardTitle className="text-sm text-slate-400">المجموعات</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-semibold text-white">{groups.length}</p>
					</CardContent>
				</Card>
				<Card className="border-slate-800 bg-slate-900/40">
					<CardHeader>
						<CardTitle className="text-sm text-slate-400">التغييرات المعلقة</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-semibold text-white">{dirtyKeys.length}</p>
					</CardContent>
				</Card>
			</section>

			<section className="space-y-4">
				<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
					<div className="flex flex-wrap items-center gap-2">
						<Button
							variant={groupFilter === null ? "default" : "outline"}
							size="sm"
							onClick={() => setGroupFilter(null)}
						>
							الكل
						</Button>
						{groups.map((group) => (
							<Button
								key={group}
								variant={groupFilter === group ? "default" : "outline"}
								size="sm"
								onClick={() => setGroupFilter((current) => (current === group ? null : group))}
							>
								{group}
							</Button>
						))}
					</div>
					<div className="flex items-center gap-2">
						<Input
							placeholder="بحث في الإعدادات"
							value={searchInput}
							onChange={(event) => setSearchInput(event.target.value)}
							className="w-60 bg-slate-900/60 border-slate-800 placeholder:text-slate-600"
						/>
						{dirtyKeys.length > 0 && (
							<Button
								variant="secondary"
								disabled={bulkUpdateMutation.isPending}
								onClick={handleBulkSave}
							>
								{bulkUpdateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
								<span className="mr-2">حفظ التغييرات ({dirtyKeys.length})</span>
							</Button>
						)}
					</div>
				</div>

				<Card className="border-slate-800 bg-slate-900/40">
					<CardContent className="p-0">
						<ScrollArea className="h-[540px]">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="w-[220px]">المفتاح</TableHead>
										<TableHead>القيمة</TableHead>
										<TableHead className="w-[180px]">المجموعة</TableHead>
										<TableHead className="hidden md:table-cell">الوصف</TableHead>
										<TableHead className="w-[120px] text-center">سري</TableHead>
										<TableHead className="w-[180px]" />
									</TableRow>
								</TableHeader>
								<TableBody>
									{settingsQuery.isLoading && (
										<TableRow>
											<TableCell colSpan={6} className="h-32 text-center text-slate-500">
												<Loader2 className="h-4 w-4 animate-spin mx-auto" />
												<p className="mt-2">جاري تحميل الإعدادات...</p>
											</TableCell>
										</TableRow>
									)}
									{!settingsQuery.isLoading && settings.length === 0 && (
										<TableRow>
											<TableCell colSpan={6} className="h-32 text-center text-slate-500">
												لا توجد إعدادات مطابقة للبحث الحالي.
											</TableCell>
										</TableRow>
									)}
									{settings.map((setting) => (
										<SettingRow
											key={setting.key}
											setting={setting}
											draft={drafts[setting.key]}
											error={errors[setting.key]}
											onChange={(changes) => handleDraftChange(setting.key, changes)}
											onSave={() => handleSingleSave(setting.key)}
											onDelete={() => setActiveDelete({ key: setting.key })}
											onReset={() => setActiveDelete({ key: setting.key, reset: true })}
											isDirty={drafts[setting.key] !== undefined}
											isSaving={singleUpdateMutation.isPending && singleUpdateMutation.variables?.key === setting.key}
											isDeleting={deleteMutation.isPending && deleteMutation.variables?.key === setting.key}
										/>
									))}
								</TableBody>
							</Table>
						</ScrollArea>
					</CardContent>
				</Card>
			</section>

			<NewSettingDialog
				open={isNewDialogOpen}
				onOpenChange={setIsNewDialogOpen}
				onSubmit={handleCreate}
				isSubmitting={createMutation.isPending}
				groups={groups}
			/>

			<AlertDialog open={Boolean(activeDelete)} onOpenChange={(open) => !open && setActiveDelete(null)}>
				<AlertDialogContent className="bg-slate-950 border border-slate-800">
					<AlertDialogHeader>
						<AlertDialogTitle>
							{activeDelete?.reset ? "استعادة القيمة الافتراضية" : "حذف الإعداد"}
						</AlertDialogTitle>
						<AlertDialogDescription>
							سيتم {activeDelete?.reset ? "إرجاع" : "إزالة"} الإعداد {activeDelete?.key}. هل ترغب بالاستمرار؟
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={deleteMutation.isPending}>إلغاء</AlertDialogCancel>
						<AlertDialogAction
							disabled={deleteMutation.isPending}
							onClick={() => activeDelete && deleteMutation.mutate(activeDelete)}
							className={cn("flex items-center gap-2", activeDelete?.reset ? "bg-indigo-600 hover:bg-indigo-700" : "bg-rose-600 hover:bg-rose-700")}
						>
							{deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
							<span>{activeDelete?.reset ? "تأكيد" : "حذف"}</span>
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}

interface SettingRowProps {
	setting: SettingsItem
	draft?: Partial<SettingsItem>
	onChange: (changes: Partial<SettingsItem>) => void
	onSave: () => void
	onDelete: () => void
	onReset: () => void
	isDirty: boolean
	isSaving: boolean
	isDeleting: boolean
	error?: string
}

function SettingRow({ setting, draft, onChange, onSave, onDelete, onReset, isDirty, isSaving, isDeleting, error }: SettingRowProps) {
	const merged = { ...setting, ...draft }

	return (
		<TableRow className={cn(isDirty && "bg-indigo-500/5")}> 
			<TableCell>
				<div className="flex flex-col">
					<span className="font-medium text-white">{setting.key}</span>
					{setting.defaultValue && (
						<span className="text-xs text-slate-500">القيمة الافتراضية: {setting.defaultValue}</span>
					)}
				</div>
			</TableCell>
			<TableCell>
				<Input
					value={merged.value}
					onChange={(event) => onChange({ value: event.target.value })}
					className="bg-slate-900/60 border-slate-800"
					placeholder="القيمة"
				/>
				{error && (
					<p className="mt-2 text-xs text-rose-400 flex items-center gap-1">
						<AlertCircle className="h-4 w-4" />
						{error}
					</p>
				)}
			</TableCell>
			<TableCell>
				<Input
					value={merged.group}
					onChange={(event) => onChange({ group: event.target.value })}
					className="bg-slate-900/60 border-slate-800"
					placeholder="المجموعة"
				/>
			</TableCell>
			<TableCell className="hidden md:table-cell">
				<Input
					value={merged.description ?? ""}
					onChange={(event) => onChange({ description: event.target.value })}
					className="bg-slate-900/60 border-slate-800"
					placeholder="الوصف"
				/>
			</TableCell>
			<TableCell className="text-center">
				<div className="flex items-center justify-center gap-2">
					<Switch checked={merged.isSecret} onCheckedChange={(checked) => onChange({ isSecret: checked })} />
					{merged.isSecret && <Badge variant="outline" className="border-amber-400/40 text-amber-300">سري</Badge>}
				</div>
			</TableCell>
			<TableCell>
				<div className="flex flex-wrap items-center gap-2 justify-end">
					<Button
						variant="secondary"
						size="sm"
						disabled={!isDirty || isSaving}
						onClick={() => {
							if (!isDirty || isSaving) return
							onSave()
						}}
					>
						{isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
						<span className="mr-2">حفظ</span>
					</Button>
					<Button
						variant="outline"
						size="sm"
						disabled={isDeleting || setting.defaultValue === null || setting.defaultValue === undefined}
						onClick={() => {
							if (isDeleting || setting.defaultValue === null || setting.defaultValue === undefined) return
							onReset()
						}}
					>
						إرجاع الافتراضي
					</Button>
					<Button variant="destructive" size="sm" onClick={onDelete} disabled={isDeleting}>
						{isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
						<span className="mr-2">حذف</span>
					</Button>
				</div>
			</TableCell>
		</TableRow>
	)
}

interface NewSettingDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onSubmit: (data: z.infer<typeof settingSchema> & { defaultValue?: string | null }) => void
	isSubmitting: boolean
	groups: string[]
}

function NewSettingDialog({ open, onOpenChange, onSubmit, isSubmitting, groups }: NewSettingDialogProps) {
	const [form, setForm] = useState({
		key: "",
		value: "",
		group: "general",
		description: "",
		isSecret: false,
		defaultValue: "",
	})
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!open) {
			setForm({ key: "", value: "", group: "general", description: "", isSecret: false, defaultValue: "" })
			setError(null)
		}
	}, [open])

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="bg-slate-950 border border-slate-800">
				<DialogHeader>
					<DialogTitle>إضافة إعداد جديد</DialogTitle>
					<DialogDescription>قم بإنشاء إعداد جديد للمستوى التشغيلي.</DialogDescription>
				</DialogHeader>
				<div className="space-y-4">
					<div className="grid gap-2">
						<label className="text-sm text-slate-400">المفتاح</label>
						<Input value={form.key} onChange={(event) => setForm((prev) => ({ ...prev, key: event.target.value }))} />
					</div>
					<div className="grid gap-2">
						<label className="text-sm text-slate-400">القيمة</label>
						<Input value={form.value} onChange={(event) => setForm((prev) => ({ ...prev, value: event.target.value }))} />
					</div>
					<div className="grid gap-2">
						<label className="text-sm text-slate-400">المجموعة</label>
						<Input
							value={form.group}
							onChange={(event) => setForm((prev) => ({ ...prev, group: event.target.value }))}
							list="settings-groups"
						/>
						<datalist id="settings-groups">
							{groups.map((group) => (
								<option key={group} value={group} />
							))}
						</datalist>
					</div>
					<div className="grid gap-2">
						<label className="text-sm text-slate-400">الوصف (اختياري)</label>
						<Input value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} />
					</div>
					<div className="grid gap-2">
						<label className="text-sm text-slate-400">القيمة الافتراضية (اختياري)</label>
						<Input value={form.defaultValue} onChange={(event) => setForm((prev) => ({ ...prev, defaultValue: event.target.value }))} />
					</div>
					<div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-3">
						<div>
							<p className="text-sm font-medium text-white">علامة سرية</p>
							<p className="text-xs text-slate-500">إخفاء القيمة في الواجهة لمن لا يملك صلاحية.</p>
						</div>
						<Switch checked={form.isSecret} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, isSecret: checked }))} />
					</div>
					{error && (
						<p className="text-sm text-rose-400 flex items-center gap-1">
							<AlertCircle className="h-4 w-4" />
							{error}
						</p>
					)}
				</div>
				<DialogFooter className="mt-6 flex justify-end gap-2">
					<Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
						إلغاء
					</Button>
					<Button
						onClick={() => {
							const result = settingSchema.extend({ defaultValue: z.string().optional() }).safeParse(form)
							if (!result.success) {
								setError(result.error.errors[0]?.message ?? "الرجاء التحقق من البيانات")
								return
							}
							onSubmit(result.data)
						}}
						disabled={isSubmitting}
					>
						{isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
						<span className="mr-2">إضافة</span>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

function settingsEqual(a: SettingsItem, b: SettingsItem) {
	return a.value === b.value && a.group === b.group && (a.description ?? "") === (b.description ?? "") && a.isSecret === b.isSecret
}