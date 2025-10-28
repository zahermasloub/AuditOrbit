"use client"

import { useState } from "react"
import {
  Upload,
  FileText,
  ImageIcon,
  File,
  Download,
  Eye,
  Trash2,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Evidence {
  id: number
  title: string
  description: string
  fileName: string
  fileType: string
  fileSize: string
  uploadedBy: string
  uploadedDate: string
  engagementId: number
  engagementTitle: string
  checklistItemId?: number
  aiProcessed: boolean
  aiExtractedData?: {
    documentType: string
    keyFields: { label: string; value: string }[]
    confidence: number
  }
  tags: string[]
  status: "pending" | "processing" | "processed" | "verified"
}

export function EvidenceSection() {
  const [evidence, setEvidence] = useState<Evidence[]>([
    {
      id: 1,
      title: "سياسة المشتريات 2024",
      description: "وثيقة سياسة المشتريات المعتمدة",
      fileName: "procurement-policy-2024.pdf",
      fileType: "PDF",
      fileSize: "2.4 MB",
      uploadedBy: "أحمد محمد",
      uploadedDate: "2025-01-15",
      engagementId: 1,
      engagementTitle: "تدقيق نظام المشتريات",
      checklistItemId: 1,
      aiProcessed: true,
      aiExtractedData: {
        documentType: "سياسة",
        keyFields: [
          { label: "رقم الوثيقة", value: "POL-2024-001" },
          { label: "تاريخ الاعتماد", value: "2024-01-10" },
          { label: "المعتمد من", value: "الرئيس التنفيذي" },
          { label: "تاريخ المراجعة", value: "2025-01-10" },
        ],
        confidence: 95,
      },
      tags: ["سياسة", "مشتريات", "معتمد"],
      status: "verified",
    },
    {
      id: 2,
      title: "مصفوفة الصلاحيات",
      description: "مصفوفة صلاحيات الموافقة على المشتريات",
      fileName: "approval-matrix.xlsx",
      fileType: "Excel",
      fileSize: "156 KB",
      uploadedBy: "أحمد محمد",
      uploadedDate: "2025-01-16",
      engagementId: 1,
      engagementTitle: "تدقيق نظام المشتريات",
      checklistItemId: 2,
      aiProcessed: true,
      aiExtractedData: {
        documentType: "جدول بيانات",
        keyFields: [
          { label: "عدد المستويات", value: "5" },
          { label: "أعلى صلاحية", value: "1,000,000 ريال" },
          { label: "عدد المعتمدين", value: "12" },
        ],
        confidence: 88,
      },
      tags: ["صلاحيات", "موافقات", "مشتريات"],
      status: "verified",
    },
    {
      id: 3,
      title: "عينة طلبات الشراء",
      description: "30 طلب شراء للاختبار",
      fileName: "purchase-orders-sample.pdf",
      fileType: "PDF",
      fileSize: "8.7 MB",
      uploadedBy: "سارة علي",
      uploadedDate: "2025-01-20",
      engagementId: 1,
      engagementTitle: "تدقيق نظام المشتريات",
      aiProcessed: true,
      aiExtractedData: {
        documentType: "طلبات شراء",
        keyFields: [
          { label: "عدد الطلبات", value: "30" },
          { label: "إجمالي القيمة", value: "2,450,000 ريال" },
          { label: "الفترة", value: "Q4 2024" },
        ],
        confidence: 92,
      },
      tags: ["طلبات شراء", "عينة", "اختبار"],
      status: "processed",
    },
    {
      id: 4,
      title: "فاتورة مورد - شركة ABC",
      description: "فاتورة شراء معدات مكتبية",
      fileName: "invoice-abc-2024-1234.pdf",
      fileType: "PDF",
      fileSize: "345 KB",
      uploadedBy: "سارة علي",
      uploadedDate: "2025-01-22",
      engagementId: 1,
      engagementTitle: "تدقيق نظام المشتريات",
      aiProcessed: false,
      tags: ["فاتورة", "مورد"],
      status: "processing",
    },
  ])

  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload and AI processing
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          setShowUploadDialog(false)
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-slate-500/20 text-slate-300 border-slate-500/30"
      case "processing":
        return "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
      case "processed":
        return "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
      case "verified":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
      default:
        return ""
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "معلق"
      case "processing":
        return "جاري المعالجة"
      case "processed":
        return "تمت المعالجة"
      case "verified":
        return "تم التحقق"
      default:
        return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />
      case "processing":
        return <Clock className="h-4 w-4 text-indigo-400 animate-spin" />
      case "processed":
        return <AlertCircle className="h-4 w-4 text-cyan-400" />
      default:
        return <Clock className="h-4 w-4 text-slate-400" />
    }
  }

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case "pdf":
        return <FileText className="h-8 w-8 text-red-400" />
      case "excel":
      case "xlsx":
        return <File className="h-8 w-8 text-green-400" />
      case "image":
      case "jpg":
      case "png":
        return <ImageIcon className="h-8 w-8 text-blue-400" />
      default:
        return <File className="h-8 w-8 text-slate-400" />
    }
  }

  const statusCounts = {
    total: evidence.length,
    pending: evidence.filter((e) => e.status === "pending").length,
    processing: evidence.filter((e) => e.status === "processing").length,
    processed: evidence.filter((e) => e.status === "processed").length,
    verified: evidence.filter((e) => e.status === "verified").length,
    aiProcessed: evidence.filter((e) => e.aiProcessed).length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white">إدارة الأدلة</h3>
          <p className="text-slate-400 mt-1">رفع وإدارة الأدلة التدقيقية مع معالجة ذكية بالذكاء الاصطناعي</p>
        </div>
        <Button
          onClick={() => setShowUploadDialog(true)}
          className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700"
        >
          <Upload className="h-4 w-4 ml-2" />
          رفع أدلة
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">إجمالي الأدلة</p>
                <p className="text-3xl font-bold text-white">{statusCounts.total}</p>
              </div>
              <File className="h-10 w-10 text-indigo-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">معلق</p>
                <p className="text-3xl font-bold text-slate-400">{statusCounts.pending}</p>
              </div>
              <Clock className="h-10 w-10 text-slate-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">جاري المعالجة</p>
                <p className="text-3xl font-bold text-indigo-400">{statusCounts.processing}</p>
              </div>
              <Sparkles className="h-10 w-10 text-indigo-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">تمت المعالجة</p>
                <p className="text-3xl font-bold text-cyan-400">{statusCounts.processed}</p>
              </div>
              <AlertCircle className="h-10 w-10 text-cyan-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">تم التحقق</p>
                <p className="text-3xl font-bold text-emerald-400">{statusCounts.verified}</p>
              </div>
              <CheckCircle2 className="h-10 w-10 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">معالج بالذكاء</p>
                <p className="text-3xl font-bold text-purple-400">{statusCounts.aiProcessed}</p>
              </div>
              <Sparkles className="h-10 w-10 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Evidence List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {evidence.map((item) => (
          <Card key={item.id} className="bg-slate-900 border-slate-800 hover:border-indigo-500/50 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-3 bg-slate-800 rounded-lg">{getFileIcon(item.fileType)}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-semibold mb-1 truncate">{item.title}</h4>
                  <p className="text-slate-400 text-xs mb-2 line-clamp-2">{item.description}</p>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(item.status)} className="text-xs">
                      <span className="ml-1">{getStatusIcon(item.status)}</span>
                      {getStatusLabel(item.status)}
                    </Badge>
                    {item.aiProcessed && (
                      <Badge variant="outline" className="border-purple-500/30 text-purple-300 text-xs">
                        <Sparkles className="h-3 w-3 ml-1" />
                        AI
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">الملف</span>
                  <span className="text-white font-mono">{item.fileName}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">الحجم</span>
                  <span className="text-white">{item.fileSize}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">رفع بواسطة</span>
                  <span className="text-white">{item.uploadedBy}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">التاريخ</span>
                  <span className="text-white">{item.uploadedDate}</span>
                </div>
              </div>

              {item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {item.tags.map((tag, idx) => (
                    <Badge key={idx} variant="outline" className="border-slate-600 text-slate-300 text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedEvidence(item)
                    setShowViewDialog(true)
                  }}
                  className="flex-1 text-slate-400 hover:text-white"
                >
                  <Eye className="h-4 w-4 ml-1" />
                  عرض
                </Button>
                <Button variant="ghost" size="sm" className="flex-1 text-slate-400 hover:text-white">
                  <Download className="h-4 w-4 ml-1" />
                  تحميل
                </Button>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-400">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">رفع أدلة جديدة</DialogTitle>
            <DialogDescription className="text-slate-400">
              قم برفع المستندات والصور كأدلة تدقيقية. سيتم معالجتها تلقائياً بالذكاء الاصطناعي.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            {!isUploading ? (
              <div className="border-2 border-dashed border-slate-700 rounded-lg p-12 text-center hover:border-indigo-500/50 transition-colors">
                <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-white font-medium mb-2">اسحب الملفات هنا أو انقر للاختيار</p>
                <p className="text-slate-400 text-sm mb-4">PDF, Excel, Word, Images (حتى 10 MB)</p>
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.xlsx,.xls,.doc,.docx,.jpg,.jpeg,.png"
                />
                <label htmlFor="file-upload">
                  <Button
                    type="button"
                    onClick={() => document.getElementById("file-upload")?.click()}
                    className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700"
                  >
                    اختر الملفات
                  </Button>
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-6 w-6 text-indigo-400 animate-pulse" />
                  <div className="flex-1">
                    <p className="text-white font-medium mb-1">جاري الرفع والمعالجة بالذكاء الاصطناعي...</p>
                    <p className="text-slate-400 text-sm">استخراج البيانات وتحليل المحتوى</p>
                  </div>
                </div>
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-center text-slate-400 text-sm">{uploadProgress}%</p>
              </div>
            )}

            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium mb-1">المعالجة الذكية</p>
                  <ul className="text-sm text-slate-300 space-y-1">
                    <li>• استخراج النصوص من المستندات (OCR)</li>
                    <li>• تحديد نوع الوثيقة تلقائياً</li>
                    <li>• استخراج الحقول الرئيسية والبيانات</li>
                    <li>• تصنيف وفهرسة ذكية</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Evidence Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedEvidence?.title}</DialogTitle>
            <DialogDescription className="text-slate-400">{selectedEvidence?.description}</DialogDescription>
          </DialogHeader>
          {selectedEvidence && (
            <Tabs defaultValue="details" className="mt-4">
              <TabsList className="bg-slate-800 border border-slate-700">
                <TabsTrigger value="details">التفاصيل</TabsTrigger>
                {selectedEvidence.aiProcessed && <TabsTrigger value="ai-data">البيانات المستخرجة</TabsTrigger>}
              </TabsList>
              <TabsContent value="details" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="pt-4">
                      <p className="text-sm text-slate-400 mb-1">نوع الملف</p>
                      <p className="text-lg font-semibold text-white">{selectedEvidence.fileType}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="pt-4">
                      <p className="text-sm text-slate-400 mb-1">الحجم</p>
                      <p className="text-lg font-semibold text-white">{selectedEvidence.fileSize}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="pt-4">
                      <p className="text-sm text-slate-400 mb-1">رفع بواسطة</p>
                      <p className="text-lg font-semibold text-white">{selectedEvidence.uploadedBy}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="pt-4">
                      <p className="text-sm text-slate-400 mb-1">التاريخ</p>
                      <p className="text-lg font-semibold text-white">{selectedEvidence.uploadedDate}</p>
                    </CardContent>
                  </Card>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-2">المهمة المرتبطة</p>
                  <Badge variant="outline" className="border-indigo-500/30 text-indigo-300">
                    {selectedEvidence.engagementTitle}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-2">الوسوم</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvidence.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="border-slate-600 text-slate-300">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>
              {selectedEvidence.aiProcessed && selectedEvidence.aiExtractedData && (
                <TabsContent value="ai-data" className="space-y-4 mt-4">
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-5 w-5 text-purple-400" />
                      <h4 className="text-lg font-semibold text-white">البيانات المستخرجة بالذكاء الاصطناعي</h4>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-slate-400 mb-1">نوع الوثيقة</p>
                        <p className="text-white font-medium">{selectedEvidence.aiExtractedData.documentType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400 mb-2">الحقول الرئيسية</p>
                        <div className="space-y-2">
                          {selectedEvidence.aiExtractedData.keyFields.map((field, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-slate-800 rounded">
                              <span className="text-slate-300 text-sm">{field.label}</span>
                              <span className="text-white font-medium">{field.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400 mb-2">مستوى الثقة</p>
                        <div className="flex items-center gap-3">
                          <Progress value={selectedEvidence.aiExtractedData.confidence} className="h-2 flex-1" />
                          <span className="text-white font-semibold">
                            {selectedEvidence.aiExtractedData.confidence}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
