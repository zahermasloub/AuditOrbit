# نظام عرض البيانات - الخطط السنوية والمهام التدقيقية
## ملف تصدير شامل للرفع لأداة الذكاء الاصطناعي

---

## 📋 جدول المحتويات
1. [نظرة عامة](#نظرة-عامة)
2. [نظام عرض الخطط السنوية](#نظام-عرض-الخطط-السنوية)
3. [نظام عرض المهام التدقيقية](#نظام-عرض-المهام-التدقيقية)
4. [الأكواد الكاملة](#الأكواد-الكاملة)
5. [هياكل البيانات](#هياكل-البيانات)
6. [دليل التكامل](#دليل-التكامل)

---

## 🎯 نظرة عامة

### الهدف
توثيق شامل لنظام عرض البيانات بعد إنشاء الخطط السنوية والمهام التدقيقية، مع شرح تفصيلي لكل عنصر ووظيفته.

### التقنيات المستخدمة
- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Language**: TypeScript

---

## 📊 نظام عرض الخطط السنوية

### 1. هيكل العرض الرئيسي

#### أ. رأس القسم (Header)
\`\`\`tsx
<div className="flex items-center justify-between">
  <div>
    <h3 className="text-2xl font-bold text-white">الخطط السنوية للتدقيق</h3>
    <p className="text-slate-400 mt-1">إدارة الخطط السنوية القائمة على المخاطر</p>
  </div>
  <Button onClick={() => setShowCreateDialog(true)}>
    <Plus className="h-4 w-4 ml-2" />
    خطة جديدة
  </Button>
</div>
\`\`\`

**العناصر:**
- **العنوان**: "الخطط السنوية للتدقيق" - نص بحجم 2xl ولون أبيض
- **الوصف**: "إدارة الخطط السنوية القائمة على المخاطر" - نص بلون slate-400
- **زر "خطة جديدة"**: 
  - **الوظيفة**: `onClick={() => setShowCreateDialog(true)}`
  - **الإجراء**: فتح نافذة حوارية لإنشاء خطة جديدة
  - **التصميم**: خلفية متدرجة من indigo-600 إلى cyan-600

#### ب. بطاقات الإحصائيات (Stats Cards)
\`\`\`tsx
<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
  {/* بطاقة إجمالي الخطط */}
  <Card>
    <CardContent>
      <p className="text-sm text-slate-400">إجمالي الخطط</p>
      <p className="text-3xl font-bold text-white">{plans.length}</p>
      <Calendar className="h-10 w-10 text-indigo-400" />
    </CardContent>
  </Card>
  
  {/* بطاقة المهام المخططة */}
  <Card>
    <CardContent>
      <p className="text-sm text-slate-400">المهام المخططة</p>
      <p className="text-3xl font-bold text-white">
        {plans.reduce((sum, plan) => sum + plan.totalEngagements, 0)}
      </p>
      <Target className="h-10 w-10 text-cyan-400" />
    </CardContent>
  </Card>
  
  {/* بطاقة المهام المكتملة */}
  <Card>
    <CardContent>
      <p className="text-sm text-slate-400">المهام المكتملة</p>
      <p className="text-3xl font-bold text-white">
        {plans.reduce((sum, plan) => sum + plan.completedEngagements, 0)}
      </p>
      <CheckCircle2 className="h-10 w-10 text-emerald-400" />
    </CardContent>
  </Card>
  
  {/* بطاقة الساعات المخططة */}
  <Card>
    <CardContent>
      <p className="text-sm text-slate-400">الساعات المخططة</p>
      <p className="text-3xl font-bold text-white">
        {plans.reduce((sum, plan) => sum + plan.riskBasedHours, 0)}
      </p>
      <Clock className="h-10 w-10 text-orange-400" />
    </CardContent>
  </Card>
</div>
\`\`\`

**العناصر:**
1. **بطاقة إجمالي الخطط**
   - **البيانات**: عدد الخطط الكلي (`plans.length`)
   - **الأيقونة**: Calendar بلون indigo-400
   - **الوظيفة**: عرض إحصائي فقط

2. **بطاقة المهام المخططة**
   - **البيانات**: مجموع المهام من جميع الخطط
   - **الحساب**: `plans.reduce((sum, plan) => sum + plan.totalEngagements, 0)`
   - **الأيقونة**: Target بلون cyan-400

3. **بطاقة المهام المكتملة**
   - **البيانات**: مجموع المهام المكتملة
   - **الحساب**: `plans.reduce((sum, plan) => sum + plan.completedEngagements, 0)`
   - **الأيقونة**: CheckCircle2 بلون emerald-400

4. **بطاقة الساعات المخططة**
   - **البيانات**: مجموع الساعات المخططة
   - **الحساب**: `plans.reduce((sum, plan) => sum + plan.riskBasedHours, 0)`
   - **الأيقونة**: Clock بلون orange-400

#### ج. قائمة الخطط (Plans List)

**بطاقة الخطة الواحدة:**
\`\`\`tsx
<Card className="bg-slate-900 border-slate-800 hover:border-indigo-500/50">
  <CardContent>
    {/* رأس البطاقة */}
    <div className="flex items-start justify-between">
      <div className="flex-1">
        {/* العنوان والحالة */}
        <div className="flex items-center gap-3">
          <h4 className="text-xl font-semibold text-white">{plan.title}</h4>
          <Badge className={getStatusColor(plan.status)}>
            {getStatusLabel(plan.status)}
          </Badge>
        </div>
        
        {/* الوصف */}
        <p className="text-slate-400 text-sm">{plan.description}</p>
        
        {/* الإدارات */}
        <div className="flex flex-wrap gap-2">
          {plan.departments.map((dept, idx) => (
            <Badge key={idx} variant="outline">{dept}</Badge>
          ))}
        </div>
      </div>
      
      {/* أزرار الإجراءات */}
      <div className="flex gap-2">
        <Button variant="ghost" size="icon" onClick={() => handleView(plan)}>
          <Eye className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => handleEdit(plan)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => handleDelete(plan)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
    
    {/* معلومات إضافية */}
    <div className="grid grid-cols-4 gap-4">
      <div className="p-3 bg-slate-800/50 rounded-lg">
        <p className="text-xs text-slate-400">المهام</p>
        <p className="text-lg font-semibold text-white">
          {plan.completedEngagements} / {plan.totalEngagements}
        </p>
      </div>
      <div className="p-3 bg-slate-800/50 rounded-lg">
        <p className="text-xs text-slate-400">الساعات</p>
        <p className="text-lg font-semibold text-white">
          {plan.actualHours} / {plan.riskBasedHours}
        </p>
      </div>
      <div className="p-3 bg-slate-800/50 rounded-lg">
        <p className="text-xs text-slate-400">معتمد من</p>
        <p className="text-lg font-semibold text-white">{plan.approvedBy || "-"}</p>
      </div>
      <div className="p-3 bg-slate-800/50 rounded-lg">
        <p className="text-xs text-slate-400">تاريخ الاعتماد</p>
        <p className="text-lg font-semibold text-white">{plan.approvedDate || "-"}</p>
      </div>
    </div>
    
    {/* شريط التقدم */}
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-slate-400">نسبة الإنجاز</span>
        <span className="text-white font-medium">
          {Math.round((plan.completedEngagements / plan.totalEngagements) * 100)}%
        </span>
      </div>
      <Progress value={(plan.completedEngagements / plan.totalEngagements) * 100} />
    </div>
  </CardContent>
</Card>
\`\`\`

**العناصر والوظائف:**

1. **عنوان الخطة** (`plan.title`)
   - **النوع**: نص
   - **التصميم**: text-xl font-semibold text-white
   - **الوظيفة**: عرض اسم الخطة

2. **شارة الحالة** (`Badge`)
   - **البيانات**: `plan.status`
   - **القيم الممكنة**: draft, approved, in-progress, completed
   - **الألوان**:
     - `draft`: bg-slate-500/20 text-slate-300
     - `approved`: bg-cyan-500/20 text-cyan-300
     - `in-progress`: bg-indigo-500/20 text-indigo-300
     - `completed`: bg-emerald-500/20 text-emerald-300
   - **الوظيفة**: `getStatusColor(status)` و `getStatusLabel(status)`

3. **زر العرض** (Eye Icon)
   - **الوظيفة**: 
     \`\`\`tsx
     onClick={() => {
       setSelectedPlan(plan)
       setShowViewDialog(true)
     }}
     \`\`\`
   - **الإجراء**: فتح نافذة حوارية لعرض تفاصيل الخطة الكاملة

4. **زر التعديل** (Edit Icon)
   - **الوظيفة**: `onClick={() => handleEdit(plan)}`
   - **الإجراء**: فتح نافذة حوارية لتعديل بيانات الخطة

5. **زر الحذف** (Trash2 Icon)
   - **الوظيفة**: `onClick={() => handleDelete(plan)}`
   - **الإجراء**: حذف الخطة بعد التأكيد

6. **شارات الإدارات** (Department Badges)
   - **البيانات**: `plan.departments` (مصفوفة)
   - **التصميم**: Badge variant="outline"
   - **الوظيفة**: عرض قائمة الإدارات المشمولة في الخطة

7. **بطاقات المعلومات الإضافية** (4 بطاقات)
   - **المهام**: `{completedEngagements} / {totalEngagements}`
   - **الساعات**: `{actualHours} / {riskBasedHours}`
   - **معتمد من**: `{approvedBy}`
   - **تاريخ الاعتماد**: `{approvedDate}`

8. **شريط التقدم** (Progress Bar)
   - **الحساب**: `(completedEngagements / totalEngagements) * 100`
   - **المكون**: `<Progress value={percentage} />`
   - **الوظيفة**: عرض نسبة إنجاز المهام

### 2. نافذة إنشاء خطة جديدة (Create Dialog)

**الهيكل الكامل:**
\`\`\`tsx
<Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>إنشاء خطة سنوية جديدة</DialogTitle>
      <DialogDescription>أدخل تفاصيل الخطة السنوية للتدقيق الداخلي</DialogDescription>
    </DialogHeader>
    
    {/* القسم 1: المعلومات الأساسية */}
    <div className="space-y-4">
      <h4>المعلومات الأساسية</h4>
      
      {/* السنة المالية */}
      <Input
        id="year"
        value={formData.year}
        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
      />
      
      {/* عدد المهام المخططة */}
      <Input
        id="totalEngagements"
        type="number"
        value={formData.totalEngagements}
        onChange={(e) => setFormData({ ...formData, totalEngagements: e.target.value })}
      />
      
      {/* تاريخ بداية ونهاية الخطة */}
      <Input
        id="startDate"
        type="date"
        value={formData.startDate}
        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
      />
      <Input
        id="endDate"
        type="date"
        value={formData.endDate}
        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
      />
      
      {/* عنوان الخطة */}
      <Input
        id="title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
      />
      
      {/* الوصف */}
      <Textarea
        id="description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
      />
      
      {/* الساعات المخططة */}
      <Input
        id="riskBasedHours"
        type="number"
        value={formData.riskBasedHours}
        onChange={(e) => setFormData({ ...formData, riskBasedHours: e.target.value })}
      />
    </div>
    
    {/* القسم 2: الإدارات المستهدفة وأولويات التدقيق */}
    <div className="space-y-4">
      <h4>الإدارات المستهدفة وأولويات التدقيق</h4>
      
      <div className="space-y-2">
        {availableDepartments.map((dept) => (
          <div key={dept} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id={`dept-${dept}`}
                checked={formData.selectedDepartments.includes(dept)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setFormData({
                      ...formData,
                      selectedDepartments: [...formData.selectedDepartments, dept],
                    })
                    setDepartmentPriorities({ ...departmentPriorities, [dept]: "medium" })
                  } else {
                    setFormData({
                      ...formData,
                      selectedDepartments: formData.selectedDepartments.filter((d) => d !== dept),
                    })
                    const newPriorities = { ...departmentPriorities }
                    delete newPriorities[dept]
                    setDepartmentPriorities(newPriorities)
                  }
                }}
              />
              <Label htmlFor={`dept-${dept}`}>{dept}</Label>
            </div>
            
            {formData.selectedDepartments.includes(dept) && (
              <Select
                value={departmentPriorities[dept] || "medium"}
                onValueChange={(value) => {
                  setDepartmentPriorities({ ...departmentPriorities, [dept]: value })
                }}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">عالي</SelectItem>
                  <SelectItem value="medium">متوسط</SelectItem>
                  <SelectItem value="low">منخفض</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        ))}
      </div>
    </div>
    
    {/* القسم 3: فترة الإجازة السنوية */}
    <div className="space-y-4">
      <h4>فترة الإجازة السنوية</h4>
      
      <Input
        id="vacationStartDate"
        type="date"
        value={formData.vacationStartDate}
        onChange={(e) => setFormData({ ...formData, vacationStartDate: e.target.value })}
      />
      <Input
        id="vacationEndDate"
        type="date"
        value={formData.vacationEndDate}
        onChange={(e) => setFormData({ ...formData, vacationEndDate: e.target.value })}
      />
      
      {/* تنبيه فترة الإجازة */}
      {formData.vacationStartDate && formData.vacationEndDate && (
        <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded">
          <AlertTriangle className="h-5 w-5 text-orange-400" />
          <p>سيتم منع جدولة المهام من {formData.vacationStartDate} إلى {formData.vacationEndDate}</p>
        </div>
      )}
    </div>
    
    {/* أزرار الإجراءات */}
    <div className="flex gap-3">
      <Button onClick={handleCreatePlan} className="flex-1">
        <Plus className="h-4 w-4 ml-2" />
        إنشاء الخطة
      </Button>
      <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1">
        إلغاء
      </Button>
    </div>
  </DialogContent>
</Dialog>
\`\`\`

**وظيفة إنشاء الخطة:**
\`\`\`tsx
const handleCreatePlan = () => {
  const newPlan: AnnualPlan = {
    id: plans.length + 1,
    year: formData.year,
    startDate: formData.startDate,
    endDate: formData.endDate,
    title: formData.title,
    description: formData.description,
    status: "draft",
    totalEngagements: Number.parseInt(formData.totalEngagements),
    completedEngagements: 0,
    riskBasedHours: Number.parseInt(formData.riskBasedHours),
    actualHours: 0,
    approvedBy: "",
    approvedDate: "",
    departments: formData.selectedDepartments,
    departmentPriorities: formData.selectedDepartments.map((dept) => ({
      name: dept,
      priority: departmentPriorities[dept] || "medium",
    })),
    vacationStartDate: formData.vacationStartDate,
    vacationEndDate: formData.vacationEndDate,
  }
  
  setPlans([newPlan, ...plans])
  setShowCreateDialog(false)
  // إعادة تعيين النموذج
  setFormData({
    year: "",
    startDate: "",
    endDate: "",
    title: "",
    description: "",
    totalEngagements: "",
    riskBasedHours: "",
    vacationStartDate: "",
    vacationEndDate: "",
    selectedDepartments: [],
  })
  setDepartmentPriorities({})
}
\`\`\`

### 3. نافذة عرض تفاصيل الخطة (View Dialog)

\`\`\`tsx
<Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>{selectedPlan?.title}</DialogTitle>
      <DialogDescription>{selectedPlan?.description}</DialogDescription>
    </DialogHeader>
    
    {selectedPlan && (
      <div className="space-y-6">
        {/* بطاقات السنة والحالة */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent>
              <p className="text-sm text-slate-400">السنة</p>
              <p className="text-2xl font-bold">{selectedPlan.year}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p className="text-sm text-slate-400">الحالة</p>
              <Badge className={getStatusColor(selectedPlan.status)}>
                {getStatusLabel(selectedPlan.status)}
              </Badge>
            </CardContent>
          </Card>
        </div>
        
        {/* فترة الخطة */}
        <div className="p-4 bg-slate-800/50 rounded-lg">
          <p className="text-sm text-slate-400">فترة الخطة</p>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-cyan-400" />
            <span>{selectedPlan.startDate} - {selectedPlan.endDate}</span>
          </div>
        </div>
        
        {/* المهام والساعات */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-slate-400">المهام المكتملة</p>
            <p className="text-xl font-semibold">
              {selectedPlan.completedEngagements} / {selectedPlan.totalEngagements}
            </p>
            <Progress value={(selectedPlan.completedEngagements / selectedPlan.totalEngagements) * 100} />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-slate-400">الساعات المستخدمة</p>
            <p className="text-xl font-semibold">
              {selectedPlan.actualHours} / {selectedPlan.riskBasedHours}
            </p>
            <Progress value={(selectedPlan.actualHours / selectedPlan.riskBasedHours) * 100} />
          </div>
        </div>
        
        {/* الإدارات المستهدفة وأولويات التدقيق */}
        {selectedPlan.departmentPriorities && selectedPlan.departmentPriorities.length > 0 && (
          <div>
            <p className="text-sm text-slate-400 mb-3">الإدارات المستهدفة وأولويات التدقيق</p>
            <div className="grid grid-cols-2 gap-3">
              {selectedPlan.departmentPriorities.map((dept, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                  <span>{dept.name}</span>
                  <Badge className={getPriorityColor(dept.priority)}>
                    {getPriorityLabel(dept.priority)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* فترة الإجازة السنوية */}
        {selectedPlan.vacationStartDate && selectedPlan.vacationEndDate && (
          <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-400" />
              <p className="text-sm font-medium text-orange-300">فترة الإجازة السنوية</p>
            </div>
            <p className="text-sm text-orange-200">
              من {selectedPlan.vacationStartDate} إلى {selectedPlan.vacationEndDate}
            </p>
          </div>
        )}
        
        {/* جميع الإدارات المشمولة */}
        {selectedPlan.departments.length > 0 && (
          <div>
            <p className="text-sm text-slate-400 mb-2">جميع الإدارات المشمولة</p>
            <div className="flex flex-wrap gap-2">
              {selectedPlan.departments.map((dept, idx) => (
                <Badge key={idx} variant="outline">{dept}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    )}
  </DialogContent>
</Dialog>
\`\`\`

---

## 🎯 نظام عرض المهام التدقيقية

### 1. هيكل العرض الرئيسي

#### أ. رأس القسم (Header)
\`\`\`tsx
<div className="flex items-center justify-between">
  <div>
    <h3 className="text-2xl font-bold text-white">المهام التدقيقية</h3>
    <p className="text-slate-400 mt-1">إدارة دورة حياة المهام التدقيقية الكاملة</p>
  </div>
  <Button onClick={() => setShowCreateDialog(true)}>
    <Plus className="h-4 w-4 ml-2" />
    مهمة جديدة
  </Button>
</div>
\`\`\`

**العناصر:**
- **العنوان**: "المهام التدقيقية"
- **الوصف**: "إدارة دورة حياة المهام التدقيقية الكاملة"
- **زر "مهمة جديدة"**:
  - **الوظيفة**: `onClick={() => setShowCreateDialog(true)}`
  - **الإجراء**: فتح نافذة حوارية لإنشاء مهمة جديدة

#### ب. بطاقات الإحصائيات (Stats Cards)
\`\`\`tsx
<div className="grid grid-cols-1 md:grid-cols-5 gap-4">
  {/* التخطيط */}
  <Card>
    <CardContent>
      <p className="text-sm text-slate-400">التخطيط</p>
      <p className="text-3xl font-bold text-cyan-400">{statusCounts.planning}</p>
      <Target className="h-10 w-10 text-cyan-400" />
    </CardContent>
  </Card>
  
  {/* العمل الميداني */}
  <Card>
    <CardContent>
      <p className="text-sm text-slate-400">العمل الميداني</p>
      <p className="text-3xl font-bold text-indigo-400">{statusCounts.fieldwork}</p>
      <FileText className="h-10 w-10 text-indigo-400" />
    </CardContent>
  </Card>
  
  {/* إعداد التقرير */}
  <Card>
    <CardContent>
      <p className="text-sm text-slate-400">إعداد التقرير</p>
      <p className="text-3xl font-bold text-orange-400">{statusCounts.reporting}</p>
      <AlertCircle className="h-10 w-10 text-orange-400" />
    </CardContent>
  </Card>
  
  {/* المتابعة */}
  <Card>
    <CardContent>
      <p className="text-sm text-slate-400">المتابعة</p>
      <p className="text-3xl font-bold text-yellow-400">{statusCounts.followUp}</p>
      <Clock className="h-10 w-10 text-yellow-400" />
    </CardContent>
  </Card>
  
  {/* مكتمل */}
  <Card>
    <CardContent>
      <p className="text-sm text-slate-400">مكتمل</p>
      <p className="text-3xl font-bold text-emerald-400">{statusCounts.completed}</p>
      <CheckCircle2 className="h-10 w-10 text-emerald-400" />
    </CardContent>
  </Card>
</div>
\`\`\`

**الحسابات:**
\`\`\`tsx
const statusCounts = {
  planning: engagements.filter((e) => e.status === "planning").length,
  fieldwork: engagements.filter((e) => e.status === "fieldwork").length,
  reporting: engagements.filter((e) => e.status === "reporting").length,
  followUp: engagements.filter((e) => e.status === "follow-up").length,
  completed: engagements.filter((e) => e.status === "completed").length,
}
\`\`\`

#### ج. قائمة المهام (Engagements List)

**بطاقة المهمة الواحدة:**
\`\`\`tsx
<Card className="bg-slate-900 border-slate-800 hover:border-indigo-500/50">
  <CardContent>
    {/* رأس البطاقة */}
    <div className="flex items-start justify-between">
      <div className="flex-1">
        {/* العنوان والحالة والأولوية */}
        <div className="flex items-center gap-3">
          <h4 className="text-xl font-semibold text-white">{engagement.title}</h4>
          <Badge className={getStatusColor(engagement.status)}>
            {getStatusLabel(engagement.status)}
          </Badge>
          <Badge className={getPriorityColor(engagement.priority)}>
            {getPriorityLabel(engagement.priority)}
          </Badge>
        </div>
        
        {/* الوصف */}
        <p className="text-slate-400 text-sm">{engagement.description}</p>
        
        {/* الخطة السنوية المرتبطة */}
        {engagement.annualPlanTitle && (
          <Badge variant="outline" className="border-cyan-500/30 text-cyan-300">
            <Calendar className="h-3 w-3 ml-1" />
            {engagement.annualPlanTitle}
          </Badge>
        )}
        
        {/* معلومات إضافية */}
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <div className="flex items-center gap-1">
            <Building2 className="h-4 w-4" />
            <span>{engagement.department}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{engagement.assignedAuditors.length} مدقق</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{engagement.startDate} - {engagement.endDate}</span>
          </div>
        </div>
      </div>
      
      {/* أزرار الإجراءات */}
      <div className="flex gap-2">
        <Button variant="ghost" size="icon" onClick={() => handleView(engagement)}>
          <Eye className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => handleEdit(engagement)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => handleDelete(engagement)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
    
    {/* معلومات إضافية */}
    <div className="grid grid-cols-3 gap-4">
      <div className="p-3 bg-slate-800/50 rounded-lg">
        <p className="text-xs text-slate-400">الساعات</p>
        <p className="text-lg font-semibold text-white">
          {engagement.actualHours} / {engagement.estimatedHours}
        </p>
      </div>
      <div className="p-3 bg-slate-800/50 rounded-lg">
        <p className="text-xs text-slate-400">مستوى المخاطر</p>
        <Badge className={getRiskLevelColor(engagement.riskLevel)}>
          {getRiskLevelLabel(engagement.riskLevel)}
        </Badge>
      </div>
      <div className="p-3 bg-slate-800/50 rounded-lg">
        <p className="text-xs text-slate-400">الأهداف</p>
        <p className="text-lg font-semibold text-white">{engagement.objectives.length}</p>
      </div>
    </div>
    
    {/* شريط التقدم */}
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-400">التقدم</span>
        <span className="text-white font-medium">{engagement.progress}%</span>
      </div>
      <Progress value={engagement.progress} />
    </div>
  </CardContent>
</Card>
\`\`\`

**العناصر والوظائف:**

1. **عنوان المهمة** (`engagement.title`)
   - **النوع**: نص
   - **التصميم**: text-xl font-semibold text-white

2. **شارة الحالة** (`Badge`)
   - **البيانات**: `engagement.status`
   - **القيم الممكنة**: planning, fieldwork, reporting, follow-up, completed
   - **الألوان**:
     - `planning`: bg-cyan-500/20 text-cyan-300
     - `fieldwork`: bg-indigo-500/20 text-indigo-300
     - `reporting`: bg-orange-500/20 text-orange-300
     - `follow-up`: bg-yellow-500/20 text-yellow-300
     - `completed`: bg-emerald-500/20 text-emerald-300

3. **شارة الأولوية** (`Badge`)
   - **البيانات**: `engagement.priority`
   - **القيم الممكنة**: critical, high, medium, low
   - **الألوان**:
     - `critical`: destructive (red)
     - `high`: bg-orange-500/20 text-orange-300
     - `medium`: bg-yellow-500/20 text-yellow-300
     - `low`: outline

4. **شارة الخطة السنوية** (`Badge`)
   - **البيانات**: `engagement.annualPlanTitle`
   - **التصميم**: border-cyan-500/30 text-cyan-300 bg-cyan-500/10
   - **الأيقونة**: Calendar
   - **الوظيفة**: ربط المهمة بالخطة السنوية

5. **معلومات الإدارة** (Building2 Icon)
   - **البيانات**: `engagement.department`
   - **الوظيفة**: عرض الإدارة الخاضعة للتدقيق

6. **عدد المدققين** (Users Icon)
   - **البيانات**: `engagement.assignedAuditors.length`
   - **الوظيفة**: عرض عدد المدققين المعينين

7. **الفترة الزمنية** (Calendar Icon)
   - **البيانات**: `{startDate} - {endDate}`
   - **الوظيفة**: عرض فترة تنفيذ المهمة

8. **زر العرض** (Eye Icon)
   - **الوظيفة**:
     \`\`\`tsx
     onClick={() => {
       setSelectedEngagement(engagement)
       setShowViewDialog(true)
     }}
     \`\`\`
   - **الإجراء**: فتح نافذة حوارية لعرض تفاصيل المهمة الكاملة

9. **زر التعديل** (Edit Icon)
   - **الوظيفة**: `onClick={() => handleEdit(engagement)}`
   - **الإجراء**: فتح نافذة حوارية لتعديل بيانات المهمة

10. **زر الحذف** (Trash2 Icon)
    - **الوظيفة**: `onClick={() => handleDelete(engagement)}`
    - **الإجراء**: حذف المهمة بعد التأكيد

11. **بطاقة الساعات**
    - **البيانات**: `{actualHours} / {estimatedHours}`
    - **الوظيفة**: عرض الساعات المستخدمة من المقدرة

12. **بطاقة مستوى المخاطر**
    - **البيانات**: `engagement.riskLevel`
    - **القيم**: high, medium, low
    - **الألوان**:
      - `high`: destructive (red)
      - `medium`: bg-orange-500/20 text-orange-300
      - `low`: bg-emerald-500/20 text-emerald-300

13. **بطاقة الأهداف**
    - **البيانات**: `engagement.objectives.length`
    - **الوظيفة**: عرض عدد الأهداف

14. **شريط التقدم** (Progress Bar)
    - **البيانات**: `engagement.progress`
    - **المكون**: `<Progress value={progress} />`
    - **الوظيفة**: عرض نسبة إنجاز المهمة

### 2. نافذة إنشاء مهمة جديدة (Create Dialog)

**الهيكل الكامل:**
\`\`\`tsx
<Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>إنشاء مهمة تدقيقية جديدة</DialogTitle>
      <DialogDescription>أدخل تفاصيل المهمة التدقيقية</DialogDescription>
    </DialogHeader>
    
    {/* القسم 1: المعلومات الأساسية */}
    <div className="space-y-4">
      <h4>المعلومات الأساسية</h4>
      
      {/* الخطة السنوية */}
      <Select
        value={formData.annualPlanId}
        onValueChange={(value) => {
          setFormData({ ...formData, annualPlanId: value })
          setVacationWarning(null)
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="اختر الخطة السنوية" />
        </SelectTrigger>
        <SelectContent>
          {annualPlans.map((plan) => (
            <SelectItem key={plan.id} value={plan.id.toString()}>
              {plan.title} ({plan.year})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {/* اسم المهمة */}
      <Input
        id="title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
      />
      
      {/* الهدف من المهمة */}
      <Textarea
        id="description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
      />
      
      {/* الإدارة الخاضعة للتدقيق */}
      <Select
        value={formData.department}
        onValueChange={(value) => setFormData({ ...formData, department: value })}
      >
        <SelectTrigger>
          <SelectValue placeholder="اختر الإدارة" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="المالية">المالية</SelectItem>
          <SelectItem value="المشتريات">المشتريات</SelectItem>
          <SelectItem value="تقنية المعلومات">تقنية المعلومات</SelectItem>
          <SelectItem value="الموارد البشرية">الموارد البشرية</SelectItem>
          <SelectItem value="العمليات">العمليات</SelectItem>
        </SelectContent>
      </Select>
      
      {/* الأولوية */}
      <Select
        value={formData.priority}
        onValueChange={(value) => setFormData({ ...formData, priority: value })}
      >
        <SelectTrigger>
          <SelectValue placeholder="اختر الأولوية" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="critical">حرج</SelectItem>
          <SelectItem value="high">عالي</SelectItem>
          <SelectItem value="medium">متوسط</SelectItem>
          <SelectItem value="low">منخفض</SelectItem>
        </SelectContent>
      </Select>
    </div>
    
    {/* القسم 2: الجدولة والحالة */}
    <div className="space-y-4">
      <h4>الجدولة والحالة</h4>
      
      {/* تاريخ البدء */}
      <Input
        id="startDate"
        type="date"
        value={formData.startDate}
        onChange={(e) => handleDateChange("startDate", e.target.value)}
      />
      
      {/* تاريخ الانتهاء */}
      <Input
        id="endDate"
        type="date"
        value={formData.endDate}
        onChange={(e) => handleDateChange("endDate", e.target.value)}
      />
      
      {/* الساعات المقدرة */}
      <Input
        id="estimatedHours"
        type="number"
        value={formData.estimatedHours}
        onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
      />
      
      {/* تحذير فترة الإجازة */}
      {vacationWarning && (
        <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded">
          <AlertTriangle className="h-5 w-5 text-orange-400" />
          <p>{vacationWarning}</p>
        </div>
      )}
      
      {/* حالة المهمة */}
      <Select
        value={formData.status}
        onValueChange={(value) => setFormData({ ...formData, status: value })}
      >
        <SelectTrigger>
          <SelectValue placeholder="اختر الحالة" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="planning">مجدولة</SelectItem>
          <SelectItem value="fieldwork">جارية</SelectItem>
          <SelectItem value="reporting">تحت المراجعة</SelectItem>
          <SelectItem value="completed">منتهية</SelectItem>
        </SelectContent>
      </Select>
    </div>
    
    {/* القسم 3: تعيين الفريق */}
    <div className="space-y-4">
      <h4>تعيين الفريق</h4>
      
      {/* المدقق المسؤول */}
      <Select
        value={formData.responsibleAuditor}
        onValueChange={(value) => setFormData({ ...formData, responsibleAuditor: value })}
      >
        <SelectTrigger>
          <SelectValue placeholder="اختر المدقق المسؤول" />
        </SelectTrigger>
        <SelectContent>
          {availableAuditors.map((auditor) => (
            <SelectItem key={auditor} value={auditor}>
              {auditor}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {/* فريق المدققين المشاركين */}
      <div className="space-y-2">
        <Label>فريق المدققين المشاركين</Label>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {availableAuditors
            .filter((auditor) => auditor !== formData.responsibleAuditor)
            .map((auditor) => (
              <div key={auditor} className="flex items-center gap-2">
                <Checkbox
                  id={`auditor-${auditor}`}
                  checked={formData.teamMembers.includes(auditor)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFormData({ ...formData, teamMembers: [...formData.teamMembers, auditor] })
                    } else {
                      setFormData({
                        ...formData,
                        teamMembers: formData.teamMembers.filter((m) => m !== auditor),
                      })
                    }
                  }}
                />
                <Label htmlFor={`auditor-${auditor}`}>{auditor}</Label>
              </div>
            ))}
        </div>
        <p className="text-sm text-slate-400">
          أعضاء الفريق: {formData.teamMembers.length}
          {formData.responsibleAuditor && " + المسؤول"}
        </p>
      </div>
    </div>
    
    {/* القسم 4: تفاصيل التدقيق */}
    <div className="space-y-4">
      <h4>تفاصيل التدقيق</h4>
      
      {/* الأهداف */}
      <Textarea
        id="objectives"
        placeholder="تقييم فعالية الضوابط&#10;التحقق من الامتثال للسياسات&#10;تقييم كفاءة العمليات"
        value={formData.objectives}
        onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
      />
      
      {/* النطاق */}
      <Textarea
        id="scope"
        value={formData.scope}
        onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
      />
      
      {/* المعايير */}
      <Textarea
        id="criteria"
        value={formData.criteria}
        onChange={(e) => setFormData({ ...formData, criteria: e.target.value })}
      />
    </div>
    
    {/* أزرار الإجراءات */}
    <div className="flex gap-3">
      <Button
        onClick={handleCreateEngagement}
        disabled={!!vacationWarning}
        className="flex-1"
      >
        <Plus className="h-4 w-4 ml-2" />
        إنشاء المهمة
      </Button>
      <Button
        variant="outline"
        onClick={() => {
          setShowCreateDialog(false)
          setVacationWarning(null)
        }}
        className="flex-1"
      >
        إلغاء
      </Button>
    </div>
  </DialogContent>
</Dialog>
\`\`\`

**وظائف مهمة:**

1. **التحقق من فترة الإجازة:**
\`\`\`tsx
const isDateInVacationPeriod = (date: string, planId: string) => {
  const plan = annualPlans.find((p) => p.id === Number.parseInt(planId))
  if (!plan || !plan.vacationStartDate || !plan.vacationEndDate) return false

  const checkDate = new Date(date)
  const vacationStart = new Date(plan.vacationStartDate)
  const vacationEnd = new Date(plan.vacationEndDate)

  return checkDate >= vacationStart && checkDate <= vacationEnd
}
\`\`\`

2. **معالجة تغيير التاريخ:**
\`\`\`tsx
const handleDateChange = (field: "startDate" | "endDate", value: string) => {
  setFormData({ ...formData, [field]: value })

  if (formData.annualPlanId && value) {
    if (isDateInVacationPeriod(value, formData.annualPlanId)) {
      setVacationWarning(`التاريخ المحدد يقع ضمن فترة الإجازة السنوية. يرجى اختيار تاريخ آخر.`)
    } else {
      setVacationWarning(null)
    }
  }
}
\`\`\`

3. **إنشاء المهمة:**
\`\`\`tsx
const handleCreateEngagement = () => {
  // التحقق من فترة الإجازة
  if (
    formData.annualPlanId &&
    (isDateInVacationPeriod(formData.startDate, formData.annualPlanId) ||
      isDateInVacationPeriod(formData.endDate, formData.annualPlanId))
  ) {
    alert("لا يمكن جدولة مهمة خلال فترة الإجازة السنوية")
    return
  }

  const selectedPlan = annualPlans.find((plan) => plan.id === Number.parseInt(formData.annualPlanId))

  const newEngagement: Engagement = {
    id: engagements.length + 1,
    title: formData.title,
    description: formData.description,
    department: formData.department,
    status: formData.status as "planning" | "fieldwork" | "reporting" | "follow-up" | "completed",
    priority: formData.priority as "critical" | "high" | "medium" | "low",
    progress: 0,
    startDate: formData.startDate,
    endDate: formData.endDate,
    assignedAuditors: formData.responsibleAuditor
      ? [formData.responsibleAuditor, ...formData.teamMembers.filter((m) => m !== formData.responsibleAuditor)]
      : formData.teamMembers,
    objectives: formData.objectives.split("\n").filter((o) => o.trim()),
    scope: formData.scope,
    criteria: formData.criteria,
    estimatedHours: Number.parseInt(formData.estimatedHours),
    actualHours: 0,
    riskLevel: "medium",
    annualPlanId: formData.annualPlanId ? Number.parseInt(formData.annualPlanId) : undefined,
    annualPlanTitle: selectedPlan?.title,
  }
  
  setEngagements([newEngagement, ...engagements])
  setShowCreateDialog(false)
  // إعادة تعيين النموذج
  setFormData({
    title: "",
    description: "",
    department: "",
    priority: "medium",
    status: "planning",
    startDate: "",
    endDate: "",
    estimatedHours: "",
    objectives: "",
    scope: "",
    criteria: "",
    annualPlanId: "",
    responsibleAuditor: "",
    teamMembers: [],
  })
  setVacationWarning(null)
}
\`\`\`

### 3. نافذة عرض تفاصيل المهمة (View Dialog)

\`\`\`tsx
<Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>{selectedEngagement?.title}</DialogTitle>
      <DialogDescription>{selectedEngagement?.description}</DialogDescription>
    </DialogHeader>
    
    {selectedEngagement && (
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="planning">التخطيط</TabsTrigger>
          <TabsTrigger value="team">الفريق</TabsTrigger>
        </TabsList>
        
        {/* تبويب نظرة عامة */}
        <TabsContent value="overview" className="space-y-4">
          {/* بطاقات الحالة والأولوية */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent>
                <p className="text-sm text-slate-400">الحالة</p>
                <Badge className={getStatusColor(selectedEngagement.status)}>
                  {getStatusLabel(selectedEngagement.status)}
                </Badge>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <p className="text-sm text-slate-400">الأولوية</p>
                <Badge className={getPriorityColor(selectedEngagement.priority)}>
                  {getPriorityLabel(selectedEngagement.priority)}
                </Badge>
              </CardContent>
            </Card>
          </div>
          
          {/* شريط التقدم */}
          <div className="space-y-2">
            <p className="text-sm text-slate-400">التقدم</p>
            <Progress value={selectedEngagement.progress} />
            <p className="text-right text-sm font-medium">{selectedEngagement.progress}%</p>
          </div>
          
          {/* الساعات ومستوى المخاطر */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-400">الساعات المستخدمة</p>
              <p className="text-xl font-semibold">
                {selectedEngagement.actualHours} / {selectedEngagement.estimatedHours}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-400">مستوى المخاطر</p>
              <Badge className={getRiskLevelColor(selectedEngagement.riskLevel)}>
                {getRiskLevelLabel(selectedEngagement.riskLevel)}
              </Badge>
            </div>
          </div>
        </TabsContent>
        
        {/* تبويب التخطيط */}
        <TabsContent value="planning" className="space-y-4">
          {/* الأهداف */}
          <div>
            <h4 className="text-lg font-semibold mb-2">الأهداف</h4>
            <ul className="space-y-2">
              {selectedEngagement.objectives.map((obj, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Target className="h-4 w-4 text-indigo-400 mt-1" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* النطاق */}
          <div>
            <h4 className="text-lg font-semibold mb-2">النطاق</h4>
            <p>{selectedEngagement.scope}</p>
          </div>
          
          {/* المعايير */}
          <div>
            <h4 className="text-lg font-semibold mb-2">المعايير</h4>
            <p>{selectedEngagement.criteria}</p>
          </div>
        </TabsContent>
        
        {/* تبويب الفريق */}
        <TabsContent value="team" className="space-y-4">
          <div>
            <h4 className="text-lg font-semibold mb-3">المدققون المعينون</h4>
            <div className="space-y-2">
              {selectedEngagement.assignedAuditors.map((auditor, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                    {auditor.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-medium">{auditor}</p>
                    <p className="text-sm text-slate-400">مدقق داخلي</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    )}
  </DialogContent>
</Dialog>
\`\`\`

---

## 📦 هياكل البيانات

### 1. هيكل بيانات الخطة السنوية (AnnualPlan)

\`\`\`typescript
interface DepartmentPriority {
  name: string
  priority: "high" | "medium" | "low"
}

interface AnnualPlan {
  id: number
  year: string
  startDate: string
  endDate: string
  title: string
  description: string
  status: "draft" | "approved" | "in-progress" | "completed"
  totalEngagements: number
  completedEngagements: number
  riskBasedHours: number
  actualHours: number
  approvedBy: string
  approvedDate: string
  departments: string[]
  departmentPriorities: DepartmentPriority[]
  vacationStartDate: string
  vacationEndDate: string
}
\`\`\`

**شرح الحقول:**
- `id`: معرف فريد للخطة
- `year`: السنة المالية
- `startDate`: تاريخ بداية الخطة
- `endDate`: تاريخ نهاية الخطة
- `title`: عنوان الخطة
- `description`: وصف الخطة
- `status`: حالة الخطة (مسودة، معتمد، قيد التنفيذ، مكتمل)
- `totalEngagements`: عدد المهام المخططة
- `completedEngagements`: عدد المهام المكتملة
- `riskBasedHours`: الساعات المخططة
- `actualHours`: الساعات الفعلية المستخدمة
- `approvedBy`: الجهة المعتمدة
- `approvedDate`: تاريخ الاعتماد
- `departments`: قائمة الإدارات المشمولة
- `departmentPriorities`: أولويات التدقيق لكل إدارة
- `vacationStartDate`: تاريخ بداية الإجازة السنوية
- `vacationEndDate`: تاريخ نهاية الإجازة السنوية

### 2. هيكل بيانات المهمة التدقيقية (Engagement)

\`\`\`typescript
interface Engagement {
  id: number
  title: string
  description: string
  department: string
  status: "planning" | "fieldwork" | "reporting" | "follow-up" | "completed"
  priority: "critical" | "high" | "medium" | "low"
  progress: number
  startDate: string
  endDate: string
  assignedAuditors: string[]
  objectives: string[]
  scope: string
  criteria: string
  estimatedHours: number
  actualHours: number
  riskLevel: "high" | "medium" | "low"
  annualPlanId?: number
  annualPlanTitle?: string
}
\`\`\`

**شرح الحقول:**
- `id`: معرف فريد للمهمة
- `title`: اسم المهمة
- `description`: الهدف من المهمة
- `department`: الإدارة الخاضعة للتدقيق
- `status`: حالة المهمة (التخطيط، العمل الميداني، إعداد التقرير، المتابعة، مكتمل)
- `priority`: أولوية المهمة (حرج، عالي، متوسط، منخفض)
- `progress`: نسبة الإنجاز (0-100)
- `startDate`: تاريخ البدء
- `endDate`: تاريخ الانتهاء
- `assignedAuditors`: قائمة المدققين المعينين (المسؤول + الفريق)
- `objectives`: قائمة الأهداف
- `scope`: نطاق التدقيق
- `criteria`: معايير التدقيق
- `estimatedHours`: الساعات المقدرة
- `actualHours`: الساعات الفعلية المستخدمة
- `riskLevel`: مستوى المخاطر
- `annualPlanId`: معرف الخطة السنوية المرتبطة (اختياري)
- `annualPlanTitle`: عنوان الخطة السنوية المرتبطة (اختياري)

---

## 🎨 دوال الألوان والتسميات

### 1. دوال الخطط السنوية

\`\`\`typescript
// دالة الحصول على لون الحالة
const getStatusColor = (status: string) => {
  switch (status) {
    case "draft":
      return "bg-slate-500/20 text-slate-300 border-slate-500/30"
    case "approved":
      return "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
    case "in-progress":
      return "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
    case "completed":
      return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
    default:
      return ""
  }
}

// دالة الحصول على تسمية الحالة
const getStatusLabel = (status: string) => {
  switch (status) {
    case "draft":
      return "مسودة"
    case "approved":
      return "معتمد"
    case "in-progress":
      return "قيد التنفيذ"
    case "completed":
      return "مكتمل"
    default:
      return status
  }
}

// دالة الحصول على لون الأولوية
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-500/20 text-red-300 border-red-500/30"
    case "medium":
      return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
    case "low":
      return "bg-green-500/20 text-green-300 border-green-500/30"
    default:
      return ""
  }
}

// دالة الحصول على تسمية الأولوية
const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case "high":
      return "عالي"
    case "medium":
      return "متوسط"
    case "low":
      return "منخفض"
    default:
      return priority
  }
}
\`\`\`

### 2. دوال المهام التدقيقية

\`\`\`typescript
// دالة الحصول على لون الحالة
const getStatusColor = (status: string) => {
  switch (status) {
    case "planning":
      return "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
    case "fieldwork":
      return "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
    case "reporting":
      return "bg-orange-500/20 text-orange-300 border-orange-500/30"
    case "follow-up":
      return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
    case "completed":
      return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
    default:
      return ""
  }
}

// دالة الحصول على تسمية الحالة
const getStatusLabel = (status: string) => {
  switch (status) {
    case "planning":
      return "التخطيط"
    case "fieldwork":
      return "العمل الميداني"
    case "reporting":
      return "إعداد التقرير"
    case "follow-up":
      return "المتابعة"
    case "completed":
      return "مكتمل"
    default:
      return status
  }
}

// دالة الحصول على لون الأولوية
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "critical":
      return "destructive"
    case "high":
      return "bg-orange-500/20 text-orange-300 border-orange-500/30"
    case "medium":
      return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
    case "low":
      return "outline"
    default:
      return "secondary"
  }
}

// دالة الحصول على تسمية الأولوية
const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case "critical":
      return "حرج"
    case "high":
      return "عالي"
    case "medium":
      return "متوسط"
    case "low":
      return "منخفض"
    default:
      return priority
  }
}
\`\`\`

---

## 🔧 دليل التكامل

### 1. المتطلبات

\`\`\`json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "lucide-react": "latest",
    "@radix-ui/react-dialog": "latest",
    "@radix-ui/react-select": "latest",
    "@radix-ui/react-checkbox": "latest",
    "@radix-ui/react-tabs": "latest",
    "@radix-ui/react-progress": "latest"
  }
}
\`\`\`

### 2. خطوات التطبيق

1. **تثبيت المكونات:**
\`\`\`bash
npx shadcn@latest add dialog
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add badge
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add textarea
npx shadcn@latest add select
npx shadcn@latest add checkbox
npx shadcn@latest add tabs
npx shadcn@latest add progress
\`\`\`

2. **نسخ الملفات:**
- انسخ `components/annual-plans-section.tsx`
- انسخ `components/engagements-section.tsx`

3. **الاستخدام:**
\`\`\`tsx
import { AnnualPlansSection } from "@/components/annual-plans-section"
import { EngagementsSection } from "@/components/engagements-section"

export default function AuditPage() {
  return (
    <div className="space-y-8">
      <AnnualPlansSection />
      <EngagementsSection annualPlans={plans} />
    </div>
  )
}
\`\`\`

### 3. التكامل مع Backend

**API Endpoints المطلوبة:**

\`\`\`typescript
// الخطط السنوية
GET    /api/annual-plans          // جلب جميع الخطط
POST   /api/annual-plans          // إنشاء خطة جديدة
GET    /api/annual-plans/:id      // جلب خطة محددة
PUT    /api/annual-plans/:id      // تحديث خطة
DELETE /api/annual-plans/:id      // حذف خطة

// المهام التدقيقية
GET    /api/engagements           // جلب جميع المهام
POST   /api/engagements           // إنشاء مهمة جديدة
GET    /api/engagements/:id       // جلب مهمة محددة
PUT    /api/engagements/:id       // تحديث مهمة
DELETE /api/engagements/:id       // حذف مهمة
\`\`\`

**مثال على دالة API:**
\`\`\`typescript
// lib/api/annual-plans.ts
export async function createAnnualPlan(data: AnnualPlan) {
  const response = await fetch(`${API_BASE}/annual-plans`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  })
  
  if (!response.ok) {
    throw new Error('Failed to create annual plan')
  }
  
  return response.json()
}
\`\`\`

### 4. إدارة الحالة

**استخدام React State:**
\`\`\`typescript
const [plans, setPlans] = useState<AnnualPlan[]>([])
const [engagements, setEngagements] = useState<Engagement[]>([])

// جلب البيانات عند التحميل
useEffect(() => {
  fetchAnnualPlans().then(setPlans)
  fetchEngagements().then(setEngagements)
}, [])
\`\`\`

**أو استخدام SWR:**
\`\`\`typescript
import useSWR from 'swr'

const { data: plans, mutate: mutatePlans } = useSWR('/api/annual-plans', fetcher)
const { data: engagements, mutate: mutateEngagements } = useSWR('/api/engagements', fetcher)
\`\`\`

---

## 📝 ملاحظات مهمة

### 1. الأمان
- تأكد من التحقق من صلاحيات المستخدم قبل السماح بالإنشاء/التعديل/الحذف
- استخدم JWT tokens للمصادقة
- قم بتنظيف المدخلات قبل إرسالها للخادم

### 2. الأداء
- استخدم pagination للقوائم الطويلة
- قم بتحميل البيانات بشكل lazy عند الحاجة
- استخدم React.memo للمكونات التي لا تتغير كثيراً

### 3. تجربة المستخدم
- أضف loading states أثناء جلب البيانات
- أضف رسائل نجاح/فشل واضحة
- استخدم optimistic updates لتحسين الاستجابة

### 4. إمكانية الوصول
- تأكد من أن جميع الأزرار لها aria-labels
- استخدم semantic HTML
- تأكد من أن الألوان لها تباين كافٍ

---

## 🎯 الخلاصة

هذا الملف يوثق بشكل شامل:
- ✅ جميع عناصر واجهة المستخدم
- ✅ وظيفة كل زر وعنصر تفاعلي
- ✅ هياكل البيانات الكاملة
- ✅ دوال الألوان والتسميات
- ✅ الأكواد الكاملة لكلا المكونين
- ✅ دليل التكامل مع Backend
- ✅ أفضل الممارسات والملاحظات

يمكن استخدام هذا الملف كمرجع كامل لإعادة بناء أو تطوير نظام عرض البيانات في أي أداة ذكاء اصطناعي أخرى.

---

**تاريخ الإنشاء:** 2025
**الإصدار:** 1.0
**الحالة:** جاهز للاستخدام
