"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  FolderOpen,
  AlertCircle,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  BarChart3,
  PieChart,
  Calendar,
  Bell,
  MessageSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart as RechartsPie,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts"
import { AnnualPlansSection } from "@/components/annual-plans-section"
import { EngagementsSection } from "@/components/engagements-section"
import { ChecklistsSection } from "@/components/checklists-section"
import { EvidenceSection } from "@/components/evidence-section"
import { FindingsSection } from "@/components/findings-section"
import { ReportsSection } from "@/components/reports-section"
import { FollowUpSection } from "@/components/followup-section"

export default function DashboardPage() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeSection, setActiveSection] = useState("dashboard")

  const handleLogout = () => {
    logout()
  }

  const menuItems = [
    { id: "dashboard", label: "لوحة المعلومات", icon: LayoutDashboard },
    { id: "annual-plans", label: "الخطط السنوية", icon: Calendar },
    { id: "engagements", label: "المهام التدقيقية", icon: FileText },
    { id: "checklists", label: "قوائم التحقق", icon: CheckSquare },
    { id: "evidence", label: "الأدلة", icon: FolderOpen },
    { id: "findings", label: "النتائج", icon: AlertCircle },
    { id: "reports", label: "التقارير", icon: BarChart3 },
    { id: "followup", label: "المتابعة", icon: MessageSquare },
    { id: "users", label: "المستخدمون", icon: Users },
    { id: "settings", label: "الإعدادات", icon: Settings },
  ]

  const stats = [
    {
      title: "المهام النشطة",
      value: "12",
      change: "+3",
      trend: "up",
      icon: Target,
      color: "indigo",
    },
    {
      title: "النتائج المفتوحة",
      value: "28",
      change: "-5",
      trend: "down",
      icon: AlertCircle,
      color: "orange",
    },
    {
      title: "التقارير المعلقة",
      value: "5",
      change: "+2",
      trend: "up",
      icon: FileText,
      color: "cyan",
    },
    {
      title: "معدل الإنجاز",
      value: "87%",
      change: "+12%",
      trend: "up",
      icon: PieChart,
      color: "emerald",
    },
  ]

  const recentEngagements = [
    {
      id: 1,
      title: "تدقيق نظام المشتريات",
      department: "المشتريات",
      status: "جاري التنفيذ",
      progress: 65,
      dueDate: "2025-02-15",
      priority: "عالي",
    },
    {
      id: 2,
      title: "مراجعة الضوابط المالية",
      department: "المالية",
      status: "التخطيط",
      progress: 30,
      dueDate: "2025-03-01",
      priority: "متوسط",
    },
    {
      id: 3,
      title: "تدقيق أمن المعلومات",
      department: "تقنية المعلومات",
      status: "إعداد التقرير",
      progress: 90,
      dueDate: "2025-01-30",
      priority: "حرج",
    },
  ]

  const engagementsByStatus = [
    { name: "التخطيط", value: 8, color: "#06B6D4" },
    { name: "جاري التنفيذ", value: 12, color: "#4F46E5" },
    { name: "إعداد التقرير", value: 5, color: "#F59E0B" },
    { name: "مكتمل", value: 23, color: "#10B981" },
  ]

  const findingsBySeverity = [
    { name: "حرج", value: 5, color: "#EF4444" },
    { name: "عالي", value: 12, color: "#F97316" },
    { name: "متوسط", value: 18, color: "#F59E0B" },
    { name: "منخفض", value: 8, color: "#10B981" },
  ]

  const monthlyProgress = [
    { month: "يناير", completed: 4, planned: 6 },
    { month: "فبراير", completed: 5, planned: 7 },
    { month: "مارس", completed: 6, planned: 8 },
    { month: "أبريل", completed: 7, planned: 8 },
    { month: "مايو", completed: 8, planned: 9 },
    { month: "يونيو", completed: 9, planned: 10 },
  ]

  const departmentRiskScores = [
    { department: "المالية", score: 85 },
    { department: "المشتريات", score: 72 },
    { department: "الموارد البشرية", score: 68 },
    { department: "تقنية المعلومات", score: 91 },
    { department: "العمليات", score: 76 },
  ]

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  // Don't render dashboard if not authenticated
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-950 flex" dir="rtl">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } bg-slate-900 border-l border-slate-800 transition-all duration-300 overflow-hidden flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-cyan-600 rounded-lg flex items-center justify-center">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">AuditOrbit</h1>
              <p className="text-slate-400 text-xs">منصة التدقيق الذكية</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeSection === item.id
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
              {user.full_name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-white font-medium text-sm">{user.full_name || user.email}</p>
              <p className="text-slate-400 text-xs">
                {user.role === "admin" ? "مدير النظام" : user.role === "ia_manager" ? "مدير التدقيق" : "مدقق"}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white bg-transparent"
            size="sm"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 ml-2" />
            تسجيل الخروج
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-slate-900 border-b border-slate-800 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-slate-400 hover:text-white"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {menuItems.find((item) => item.id === activeSection)?.label}
                </h2>
                <p className="text-slate-400 text-sm">
                  {activeSection === "dashboard" && "نظرة شاملة على أنشطة التدقيق"}
                  {activeSection === "annual-plans" && "إدارة الخطط السنوية للتدقيق"}
                  {activeSection === "engagements" && "إدارة المهام التدقيقية"}
                  {activeSection === "checklists" && "قوائم التحقق وأوراق العمل"}
                  {activeSection === "evidence" && "إدارة الأدلة والمستندات"}
                  {activeSection === "findings" && "النتائج والملاحظات التدقيقية"}
                  {activeSection === "reports" && "التقارير والتحليلات"}
                  {activeSection === "followup" && "إدارة المتابعة"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 p-6 overflow-auto">
          {activeSection === "dashboard" && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, idx) => (
                  <Card key={idx} className="bg-slate-900 border-slate-800">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 bg-${stat.color}-500/10 rounded-lg border border-${stat.color}-500/20`}>
                          <stat.icon className={`h-6 w-6 text-${stat.color}-400`} />
                        </div>
                        <Badge
                          variant="outline"
                          className={`${
                            stat.trend === "up"
                              ? "border-emerald-500/30 text-emerald-400"
                              : "border-red-500/30 text-red-400"
                          }`}
                        >
                          {stat.trend === "up" ? (
                            <TrendingUp className="h-3 w-3 ml-1" />
                          ) : (
                            <TrendingDown className="h-3 w-3 ml-1" />
                          )}
                          {stat.change}
                        </Badge>
                      </div>
                      <p className="text-slate-400 text-sm mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold text-white">{stat.value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Engagements by Status */}
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-white">توزيع المهام حسب الحالة</CardTitle>
                    <CardDescription className="text-slate-400">إجمالي 48 مهمة</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <RechartsPie>
                        <Pie
                          data={engagementsByStatus}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {engagementsByStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            border: "1px solid #334155",
                            borderRadius: "8px",
                            color: "#fff",
                          }}
                        />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Findings by Severity */}
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-white">النتائج حسب الخطورة</CardTitle>
                    <CardDescription className="text-slate-400">إجمالي 43 نتيجة</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={findingsBySeverity}>
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            border: "1px solid #334155",
                            borderRadius: "8px",
                            color: "#fff",
                          }}
                        />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                          {findingsBySeverity.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Monthly Progress */}
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-white">التقدم الشهري</CardTitle>
                    <CardDescription className="text-slate-400">المهام المخططة مقابل المكتملة</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={monthlyProgress}>
                        <XAxis dataKey="month" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            border: "1px solid #334155",
                            borderRadius: "8px",
                            color: "#fff",
                          }}
                        />
                        <Line type="monotone" dataKey="planned" stroke="#06B6D4" strokeWidth={2} name="مخطط" />
                        <Line type="monotone" dataKey="completed" stroke="#10B981" strokeWidth={2} name="مكتمل" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Department Risk Scores */}
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-white">درجات المخاطر حسب الإدارة</CardTitle>
                    <CardDescription className="text-slate-400">تقييم المخاطر المؤسسية</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {departmentRiskScores.map((dept, idx) => (
                        <div key={idx}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-300">{dept.department}</span>
                            <span className="text-sm font-semibold text-white">{dept.score}</span>
                          </div>
                          <Progress value={dept.score} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Engagements */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white">المهام التدقيقية الحديثة</CardTitle>
                  <CardDescription className="text-slate-400">آخر المهام قيد التنفيذ</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentEngagements.map((engagement) => (
                      <div
                        key={engagement.id}
                        className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-indigo-500/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="text-white font-semibold mb-1">{engagement.title}</h4>
                            <p className="text-slate-400 text-sm">{engagement.department}</p>
                          </div>
                          <Badge
                            variant={
                              engagement.priority === "حرج"
                                ? "destructive"
                                : engagement.priority === "عالي"
                                  ? "default"
                                  : "secondary"
                            }
                            className={
                              engagement.priority === "عالي"
                                ? "bg-orange-500/20 text-orange-300 border-orange-500/30"
                                : engagement.priority === "متوسط"
                                  ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                                  : ""
                            }
                          >
                            {engagement.priority}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">التقدم</span>
                            <span className="text-white font-medium">{engagement.progress}%</span>
                          </div>
                          <Progress value={engagement.progress} className="h-2" />
                        </div>

                        <div className="flex items-center justify-between mt-3 text-sm">
                          <Badge variant="outline" className="border-slate-600 text-slate-300">
                            {engagement.status}
                          </Badge>
                          <div className="flex items-center gap-1 text-slate-400">
                            <Clock className="h-4 w-4" />
                            <span>{engagement.dueDate}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === "annual-plans" && <AnnualPlansSection />}

          {activeSection === "engagements" && <EngagementsSection />}

          {activeSection === "checklists" && <ChecklistsSection />}

          {activeSection === "evidence" && <EvidenceSection />}

          {activeSection === "findings" && <FindingsSection />}

          {activeSection === "reports" && <ReportsSection />}

          {activeSection === "followup" && <FollowUpSection />}

          {/* Placeholder for other sections */}
          {activeSection !== "dashboard" &&
            activeSection !== "annual-plans" &&
            activeSection !== "engagements" &&
            activeSection !== "checklists" &&
            activeSection !== "evidence" &&
            activeSection !== "findings" &&
            activeSection !== "reports" &&
            activeSection !== "followup" && (
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="pt-6 text-center py-12">
                  <div className="inline-flex p-4 bg-indigo-500/10 rounded-full mb-4">
                    {menuItems.find((item) => item.id === activeSection)?.icon &&
                      (() => {
                        const Icon = menuItems.find((item) => item.id === activeSection)!.icon
                        return <Icon className="h-8 w-8 text-indigo-400" />
                      })()}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {menuItems.find((item) => item.id === activeSection)?.label}
                  </h3>
                  <p className="text-slate-400">هذا القسم قيد التطوير</p>
                </CardContent>
              </Card>
            )}
        </div>
      </main>
    </div>
  )
}
