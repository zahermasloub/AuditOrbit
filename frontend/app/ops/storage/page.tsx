"use client"

import { Fragment, useEffect, useMemo, useRef, useState } from "react"
import {
	AlertCircle,
	ArchiveRestore,
	Check,
	ChevronLeft,
	Copy,
	Download,
	FileText,
	Folder,
	Loader2,
	MoreHorizontal,
	MoveRight,
	Pencil,
	RefreshCcw,
	Trash2,
	Upload,
} from "lucide-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { opsClient, type StorageFileItem, type StorageFolderItem } from "@/lib/ops-client"
import { useOpsSse } from "@/lib/use-sse"
import { cn } from "@/lib/utils"

type StorageData = {
	prefix: string
	folders: StorageFolderItem[]
	items: StorageFileItem[]
	nextCursor?: string | null
	count: number
}

type UploadProgress = {
	name: string
	size: number
	status: "pending" | "uploading" | "success" | "error"
	message?: string
}

const STORAGE_QUERY_KEY = ["ops-storage"]

export default function StoragePage() {
	const queryClient = useQueryClient()
	const { toast } = useToast()
	const fileInputRef = useRef<HTMLInputElement | null>(null)

	const [prefix, setPrefix] = useState<string>("")
	const [searchInput, setSearchInput] = useState("")
	const [searchTerm, setSearchTerm] = useState("")
	const [selectedKeys, setSelectedKeys] = useState<string[]>([])
	const [renameTarget, setRenameTarget] = useState<{ key: string; name: string } | null>(null)
	const [moveState, setMoveState] = useState<{ mode: "move" | "copy"; keys: string[] } | null>(null)
	const [deleteConfirm, setDeleteConfirm] = useState(false)
	const [uploadQueue, setUploadQueue] = useState<UploadProgress[]>([])

	useEffect(() => {
		const timer = setTimeout(() => setSearchTerm(searchInput.trim()), 350)
		return () => clearTimeout(timer)
	}, [searchInput])

	const storageQuery = useQuery<StorageData>({
		queryKey: [...STORAGE_QUERY_KEY, { prefix, searchTerm }],
		queryFn: () => opsClient.listStorage({ prefix: prefix || undefined, q: searchTerm || undefined }),
		staleTime: 5_000,
	})

	useOpsSse(
		() => {
			queryClient.invalidateQueries({ queryKey: STORAGE_QUERY_KEY })
		},
		{ eventTypes: ["storage"] },
	)

	const totalSize = useMemo(() => {
		return storageQuery.data?.items.reduce((acc, item) => acc + (item.size ?? 0), 0) ?? 0
	}, [storageQuery.data?.items])

	const totalFiles = storageQuery.data?.items.length ?? 0
	const totalFolders = storageQuery.data?.folders.length ?? 0

	const breadcrumbs = useMemo(() => {
		const segments = prefix.split("/").filter(Boolean)
		return segments.map((segment, index) => ({
			label: segment,
			value: segments.slice(0, index + 1).join("/"),
		}))
	}, [prefix])

	const allEntries = useMemo(() => {
		if (!storageQuery.data) return []
		return [
			...storageQuery.data.folders.map((folder) => ({ type: "folder" as const, item: folder })),
			...storageQuery.data.items.map((file) => ({ type: "file" as const, item: file })),
		]
	}, [storageQuery.data])

	const isSelected = (key: string) => selectedKeys.includes(key)

	const toggleSelect = (key: string) => {
		setSelectedKeys((prev) => (prev.includes(key) ? prev.filter((value) => value !== key) : [...prev, key]))
	}

	const toggleSelectAll = (checked: boolean) => {
		if (checked) {
			setSelectedKeys(allEntries.filter((entry) => entry.type === "file" && !entry.item.key.endsWith("/")).map((entry) => entry.item.key))
		} else {
			setSelectedKeys([])
		}
	}

	const handleNavigateFolder = (folder: StorageFolderItem) => {
		setPrefix(folder.key)
		setSelectedKeys([])
	}

	const handleNavigateBack = () => {
		const segments = prefix.split("/").filter(Boolean)
		segments.pop()
		setPrefix(segments.join("/"))
		setSelectedKeys([])
	}

	const refreshList = () => {
		queryClient.invalidateQueries({ queryKey: [...STORAGE_QUERY_KEY, { prefix, searchTerm }] })
	}

	const uploadMutation = useMutation({
		mutationFn: async (files: File[]) => {
			const queue = files.map<UploadProgress>((file) => ({
				name: file.name,
				size: file.size,
				status: "pending",
			}))
			setUploadQueue(queue)

			for (const file of files) {
				setUploadQueue((prev) =>
					prev.map((item) => (item.name === file.name ? { ...item, status: "uploading", message: "جاري الرفع..." } : item)),
				)
				try {
					const key = buildObjectKey(prefix, file.name)
					const { url, headers } = await opsClient.getUploadUrl({
						key,
						contentType: file.type || "application/octet-stream",
					})

					await uploadFile(url, file, headers)

					setUploadQueue((prev) =>
						prev.map((item) =>
							item.name === file.name
								? {
									...item,
									status: "success",
									message: "اكتمل الرفع",
								}
								: item,
						),
					)
				} catch (error) {
					const message = error instanceof Error ? error.message : "فشل رفع الملف"
					setUploadQueue((prev) =>
						prev.map((item) =>
							item.name === file.name
								? {
									...item,
									status: "error",
									message,
								}
								: item,
						),
					)
					throw error
				}
			}
		},
		onSuccess: () => {
			refreshList()
			toast({ title: "تم رفع الملفات", description: "اكتملت عملية الرفع بنجاح." })
		},
		onError: (error: unknown) => {
			const message = error instanceof Error ? error.message : "فشل رفع الملفات"
			toast({ title: "تعذر رفع بعض الملفات", description: message, variant: "destructive" })
		},
	})

	const renameMutation = useMutation({
		mutationFn: ({ key, newKey }: { key: string; newKey: string }) =>
			opsClient.renameObject({ source: key, newKey }),
		onSuccess: () => {
			setRenameTarget(null)
			refreshList()
			toast({ title: "تم تحديث الاسم", description: "تمت إعادة تسمية الملف." })
		},
		onError: (error: unknown) => {
			const message = error instanceof Error ? error.message : "تعذر إعادة التسمية"
			toast({ title: "تعذر إعادة التسمية", description: message, variant: "destructive" })
		},
	})

	const moveCopyMutation = useMutation({
		mutationFn: ({ keys, target, mode }: { keys: string[]; target: string; mode: "move" | "copy" }) =>
			opsClient.moveCopyObjects({
			items: keys.map((key) => ({ source: key, destination: buildObjectKey(target, key.split("/").pop() ?? "" ) })),
			mode,
		}),
		onSuccess: (_, variables) => {
			setMoveState(null)
			refreshList()
			toast({
				title: variables.mode === "move" ? "تم نقل الملفات" : "تم نسخ الملفات",
				description: `${variables.keys.length} عنصر`,
			})
		},
		onError: (error: unknown) => {
			const message = error instanceof Error ? error.message : "تعذر إتمام العملية"
			toast({ title: "فشل تنفيذ العملية", description: message, variant: "destructive" })
		},
	})

	const deleteMutation = useMutation({
		mutationFn: (keys: string[]) => opsClient.deleteObjects(keys),
		onSuccess: (_, keys) => {
			setSelectedKeys((prev) => prev.filter((key) => !keys.includes(key)))
			setDeleteConfirm(false)
			refreshList()
			toast({ title: "تم حذف الملفات", description: `${keys.length} عنصر` })
		},
		onError: (error: unknown) => {
			const message = error instanceof Error ? error.message : "تعذر حذف الملفات"
			toast({ title: "فشل الحذف", description: message, variant: "destructive" })
		},
	})

	const handleDownload = async (key: string) => {
		try {
			const { url } = await opsClient.getDownloadUrl(key)
			window.open(url, "_blank")
		} catch (error) {
			const message = error instanceof Error ? error.message : "تعذر إنشاء رابط التحميل"
			toast({ title: "تعذر التحميل", description: message, variant: "destructive" })
		}
	}

	const handleUpload = (files: FileList | null) => {
		if (!files?.length) return
		uploadMutation.mutate(Array.from(files))
	}

	const selectedSingle = selectedKeys.length === 1 ? allEntries.find((entry) => entry.item.key === selectedKeys[0]) : undefined
	const canRename = selectedSingle?.type === "file"

	return (
		<div className="space-y-6">
			<header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
				<div>
					<h1 className="text-2xl font-bold text-white">إدارة التخزين</h1>
					<p className="text-sm text-slate-400">رفع، تنزيل، إعادة تسمية، نقل وحذف الملفات داخل حاوية التخزين.</p>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<Button variant="secondary" onClick={refreshList} disabled={storageQuery.isFetching}>
						{storageQuery.isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />} &nbsp;تحديث
					</Button>
					<Button onClick={() => fileInputRef.current?.click()}>
						<Upload className="h-4 w-4" />
						<span className="mr-2">رفع ملفات</span>
					</Button>
					<input
						ref={fileInputRef}
						type="file"
						multiple
						className="hidden"
						onChange={(event) => handleUpload(event.target.files)}
					/>
				</div>
			</header>

			<section className="grid gap-4 md:grid-cols-3">
				<Card className="bg-slate-900/50 border-slate-800">
					<CardHeader>
						<CardTitle className="flex items-center justify-between text-sm text-slate-400">
							<span>إجمالي الملفات</span>
							<FileText className="h-4 w-4 text-indigo-400" />
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-semibold text-white">{totalFiles}</p>
					</CardContent>
				</Card>
				<Card className="bg-slate-900/50 border-slate-800">
					<CardHeader>
						<CardTitle className="flex items-center justify-between text-sm text-slate-400">
							<span>المجلدات</span>
							<Folder className="h-4 w-4 text-blue-400" />
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-semibold text-white">{totalFolders}</p>
					</CardContent>
				</Card>
				<Card className="bg-slate-900/50 border-slate-800">
					<CardHeader>
						<CardTitle className="flex items-center justify-between text-sm text-slate-400">
							<span>الحجم الكلي</span>
							<ArchiveRestore className="h-4 w-4 text-emerald-400" />
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-semibold text-white">{formatBytes(totalSize)}</p>
					</CardContent>
				</Card>
			</section>

			<section className="space-y-4">
				<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
					<div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
						<Button variant="ghost" size="sm" onClick={() => setPrefix("")} className={cn(prefix === "" && "text-white font-medium")}>الجذر</Button>
						{breadcrumbs.map((crumb) => (
							<Fragment key={crumb.value}>
								<span className="text-slate-600">/</span>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setPrefix(crumb.value)}
									className={cn(prefix === crumb.value && "text-white font-medium")}
								>
									{crumb.label}
								</Button>
							</Fragment>
						))}
					</div>
					<div className="flex items-center gap-2">
						<Input
							value={searchInput}
							onChange={(event) => setSearchInput(event.target.value)}
							placeholder="ابحث عن ملف أو مجلد"
							className="w-60 bg-slate-900/60 border-slate-800 placeholder:text-slate-600"
						/>
						{prefix && (
							<Button variant="outline" size="sm" onClick={handleNavigateBack}>
								<ChevronLeft className="h-4 w-4" />
							</Button>
						)}
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-2">
					<Button
						variant="secondary"
						size="sm"
						disabled={!canRename}
						onClick={() => {
							if (!canRename || !selectedSingle) return
							setRenameTarget({ key: selectedSingle.item.key, name: selectedSingle.item.name })
						}}
					>
						<Pencil className="h-4 w-4" />
						<span className="mr-2">إعادة تسمية</span>
					</Button>
					<Button
						variant="secondary"
						size="sm"
						disabled={selectedKeys.length === 0}
						onClick={() => setMoveState({ mode: "move", keys: selectedKeys })}
					>
						<MoveRight className="h-4 w-4" />
						<span className="mr-2">نقل</span>
					</Button>
					<Button
						variant="secondary"
						size="sm"
						disabled={selectedKeys.length === 0}
						onClick={() => setMoveState({ mode: "copy", keys: selectedKeys })}
					>
						<Copy className="h-4 w-4" />
						<span className="mr-2">نسخ</span>
					</Button>
					<Button
						variant="destructive"
						size="sm"
						disabled={selectedKeys.length === 0}
						onClick={() => setDeleteConfirm(true)}
					>
						<Trash2 className="h-4 w-4" />
						<span className="mr-2">حذف</span>
					</Button>
					{selectedSingle && selectedSingle.type === "file" && (
						<Button variant="outline" size="sm" onClick={() => handleDownload(selectedSingle.item.key)}>
							<Download className="h-4 w-4" />
							<span className="mr-2">تحميل</span>
						</Button>
					)}
				</div>

				<Card className="border-slate-800 bg-slate-900/40">
					<CardContent className="p-0">
						<ScrollArea className="h-[540px]">
							<Table>
								<TableHeader>
									<TableRow className="hover:bg-transparent">
										<TableHead className="w-12">
											<Checkbox
												checked={selectedKeys.length > 0 && selectedKeys.length === allEntries.filter((entry) => entry.type === "file" && !entry.item.key.endsWith("/")).length}
												onCheckedChange={(checked) => toggleSelectAll(Boolean(checked))}
												aria-label="تحديد الكل"
											/>
										</TableHead>
										<TableHead>الاسم</TableHead>
										<TableHead className="hidden md:table-cell">النمط</TableHead>
										<TableHead className="hidden md:table-cell text-right">الحجم</TableHead>
										<TableHead className="hidden lg:table-cell text-right">آخر تحديث</TableHead>
										<TableHead className="w-12" />
									</TableRow>
								</TableHeader>
								<TableBody>
									{storageQuery.isLoading && (
										<TableRow>
											<TableCell colSpan={6} className="h-40 text-center text-slate-400">
												<div className="flex items-center justify-center gap-2">
													<Loader2 className="h-4 w-4 animate-spin" />
													<span>جاري تحميل الملفات...</span>
												</div>
											</TableCell>
										</TableRow>
									)}
									{!storageQuery.isLoading && allEntries.length === 0 && (
										<TableRow>
											<TableCell colSpan={6} className="h-40 text-center text-slate-500">
												لا توجد ملفات حاليًا في هذا المجلد.
											</TableCell>
										</TableRow>
									)}
									{allEntries.map((entry) => (
										<TableRow
											key={entry.item.key}
											className={cn(
												"cursor-pointer",
												entry.type === "folder" && "bg-slate-900/30 hover:bg-slate-900/50",
												isSelected(entry.item.key) && "bg-indigo-500/10",
											)}
										>
											<TableCell onClick={(event) => event.stopPropagation()}>
												{entry.type === "file" && (
													<Checkbox checked={isSelected(entry.item.key)} onCheckedChange={() => toggleSelect(entry.item.key)} />
												)}
											</TableCell>
											<TableCell
												onClick={() =>
													entry.type === "folder" ? handleNavigateFolder(entry.item as StorageFolderItem) : toggleSelect(entry.item.key)
												}
											>
												<div className="flex items-center gap-3">
													{entry.type === "folder" ? (
														<Folder className="h-4 w-4 text-blue-400" />
													) : (
														<FileText className="h-4 w-4 text-slate-400" />
													)}
													<div className="flex flex-col">
														<span className="font-medium text-white">{entry.item.name}</span>
														{entry.type === "file" && entry.item.key.includes("/") && (
															<span className="text-xs text-slate-500">{entry.item.key}</span>
														)}
													</div>
												</div>
											</TableCell>
											<TableCell className="hidden md:table-cell">
												{entry.type === "folder" ? (
													<Badge variant="outline" className="border-blue-500/40 text-blue-300">مجلد</Badge>
												) : (
													<Badge variant="outline" className="border-slate-700 text-slate-300">
														{entry.item.contentType || "application/octet-stream"}
													</Badge>
												)}
											</TableCell>
											<TableCell className="hidden md:table-cell text-right">
												{entry.type === "file" ? formatBytes(entry.item.size) : "—"}
											</TableCell>
											<TableCell className="hidden lg:table-cell text-right text-slate-400">
												{entry.type === "file" && entry.item.lastModified ? formatDate(entry.item.lastModified) : "—"}
											</TableCell>
											<TableCell className="text-right">
												{entry.type === "file" && (
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button variant="ghost" size="icon" className="h-8 w-8">
																<MoreHorizontal className="h-4 w-4" />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end">
															<DropdownMenuItem onClick={() => handleDownload(entry.item.key)}>
																<Download className="h-4 w-4 ml-2" />تحميل
															</DropdownMenuItem>
															<DropdownMenuItem onClick={() => setRenameTarget({ key: entry.item.key, name: entry.item.name })}>
																<Pencil className="h-4 w-4 ml-2" />إعادة تسمية
															</DropdownMenuItem>
															<DropdownMenuItem onClick={() => setMoveState({ mode: "move", keys: [entry.item.key] })}>
																<MoveRight className="h-4 w-4 ml-2" />نقل
															</DropdownMenuItem>
															<DropdownMenuItem onClick={() => setMoveState({ mode: "copy", keys: [entry.item.key] })}>
																<Copy className="h-4 w-4 ml-2" />نسخ
															</DropdownMenuItem>
															<DropdownMenuItem className="text-rose-500" onClick={() => {
																setSelectedKeys([entry.item.key])
																setDeleteConfirm(true)
															}}>
																<Trash2 className="h-4 w-4 ml-2" />حذف
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												)}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</ScrollArea>
					</CardContent>
				</Card>
			</section>

			{!!uploadMutation.isPending && uploadQueue.length > 0 && (
				<Card className="border-slate-800 bg-slate-900/60">
					<CardHeader>
						<CardTitle className="text-sm text-slate-400">حالة الرفع</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						{uploadQueue.map((item) => (
							<div key={item.name} className="flex items-center justify-between text-sm">
								<div>
									<p className="text-white">{item.name}</p>
									<p className="text-xs text-slate-500">{formatBytes(item.size)}</p>
								</div>
								<span className={cn(
									"text-xs",
									item.status === "success" && "text-emerald-400",
									item.status === "error" && "text-rose-400",
									item.status === "uploading" && "text-indigo-400",
								)}>
									{item.message}
								</span>
							</div>
						))}
					</CardContent>
				</Card>
			)}

			<RenameDialog
				target={renameTarget}
				onClose={() => setRenameTarget(null)}
				onSubmit={(newName) => {
					if (!renameTarget) return
					const folderPrefix = renameTarget.key.split("/").slice(0, -1).join("/")
					const newKey = buildObjectKey(folderPrefix, newName)
					renameMutation.mutate({ key: renameTarget.key, newKey })
				}}
				isSubmitting={renameMutation.isPending}
			/>

			<MoveCopyDialog
				state={moveState}
				onClose={() => setMoveState(null)}
				onSubmit={(target) => {
					if (!moveState) return
					moveCopyMutation.mutate({ keys: moveState.keys, target, mode: moveState.mode })
				}}
				isSubmitting={moveCopyMutation.isPending}
			/>

			<AlertDialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
				<AlertDialogContent className="bg-slate-950 border border-slate-800">
					<AlertDialogHeader>
						<AlertDialogTitle>تأكيد حذف الملفات</AlertDialogTitle>
						<AlertDialogDescription>
							سيتم حذف {selectedKeys.length} عنصر بشكل نهائي. لا يمكن التراجع عن هذه العملية.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={deleteMutation.isPending}>إلغاء</AlertDialogCancel>
						<AlertDialogAction
							disabled={deleteMutation.isPending}
							onClick={() => deleteMutation.mutate(selectedKeys)}
							className="bg-rose-600 hover:bg-rose-700"
						>
							{deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
							<span className="mr-2">حذف</span>
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}

function buildObjectKey(prefix: string, name: string) {
	const clean = name.trim().replace(/\s+/g, " ")
	if (!prefix) return clean
	return `${prefix.replace(/\/+$/, "")}/${clean}`
}

async function uploadFile(url: string, file: File, headers: Record<string, string>) {
	const response = await fetch(url, {
		method: "PUT",
		headers,
		body: file,
	})
	if (!response.ok) {
		throw new Error("تعذر رفع الملف")
	}
}

function formatBytes(bytes?: number) {
	if (!bytes) return "0 ب"
	const units = ["ب", "ك.ب", "م.ب", "ج.ب", "ت.ب"]
	let value = bytes
	let index = 0
	while (value >= 1024 && index < units.length - 1) {
		value /= 1024
		index += 1
	}
	return `${value.toFixed(value < 10 && index > 0 ? 1 : 0)} ${units[index]}`
}

function formatDate(value: string) {
	try {
		return new Intl.DateTimeFormat("ar-EG", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "numeric",
			minute: "numeric",
		}).format(new Date(value))
	} catch {
		return value
	}
}

interface RenameDialogProps {
	target: { key: string; name: string } | null
	onClose: () => void
	onSubmit: (name: string) => void
	isSubmitting: boolean
}

function RenameDialog({ target, onClose, onSubmit, isSubmitting }: RenameDialogProps) {
	const [name, setName] = useState("")
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (target) {
			setName(target.name)
			setError(null)
		}
	}, [target])

	return (
		<Dialog open={Boolean(target)} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="bg-slate-950 border border-slate-800">
				<DialogHeader>
					<DialogTitle>إعادة تسمية الملف</DialogTitle>
					<DialogDescription>اختر اسمًا جديدًا للملف المحدد.</DialogDescription>
				</DialogHeader>
				<div className="space-y-3">
					<Input value={name} onChange={(event) => setName(event.target.value)} placeholder="اسم الملف" />
					{error && (
						<p className="text-sm text-rose-400 flex items-center gap-1">
							<AlertCircle className="h-4 w-4" />
							{error}
						</p>
					)}
				</div>
				<DialogFooter className="mt-6 flex justify-end gap-2">
					<Button variant="outline" onClick={onClose} disabled={isSubmitting}>
						إلغاء
					</Button>
					<Button
						onClick={() => {
							if (!name.trim()) {
								setError("الاسم مطلوب")
								return
							}
							onSubmit(name.trim())
						}}
						disabled={isSubmitting}
					>
						{isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
						<span className="mr-2">حفظ</span>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

interface MoveCopyDialogProps {
	state: { mode: "move" | "copy"; keys: string[] } | null
	onClose: () => void
	onSubmit: (target: string) => void
	isSubmitting: boolean
}

function MoveCopyDialog({ state, onClose, onSubmit, isSubmitting }: MoveCopyDialogProps) {
	const [target, setTarget] = useState("")
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (state) {
			setTarget("")
			setError(null)
		}
	}, [state])

	const title = state?.mode === "copy" ? "نسخ الملفات" : "نقل الملفات"
	const description = state?.mode === "copy" ? "حدد مجلد الوجهة لنسخ الملفات المحددة." : "حدد مجلد الوجهة لنقل الملفات المحددة."

	return (
		<Dialog open={Boolean(state)} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="bg-slate-950 border border-slate-800">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<div className="space-y-4">
					<div>
						<label className="text-sm text-slate-400">المسار الجديد</label>
						<Input value={target} onChange={(event) => setTarget(event.target.value)} placeholder="مثال: reports/2025" />
					</div>
					{error && (
						<p className="text-sm text-rose-400 flex items-center gap-1">
							<AlertCircle className="h-4 w-4" />
							{error}
						</p>
					)}
				</div>
				<DialogFooter className="mt-6 flex justify-end gap-2">
					<Button variant="outline" onClick={onClose} disabled={isSubmitting}>
						إلغاء
					</Button>
					<Button
						onClick={() => {
							if (!target.trim()) {
								setError("المسار مطلوب")
								return
							}
							onSubmit(target.trim())
						}}
						disabled={isSubmitting}
					>
						{isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
						<span className="mr-2">تنفيذ</span>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}