-- إضافة الأعمدة الجديدة لجدول annual_plans
ALTER TABLE annual_plans 
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE,
ADD COLUMN IF NOT EXISTS vacation_start_date DATE,
ADD COLUMN IF NOT EXISTS vacation_end_date DATE;

-- إنشاء جدول annual_plan_departments (علاقة many-to-many)
CREATE TABLE IF NOT EXISTS annual_plan_departments (
    annual_plan_id UUID NOT NULL REFERENCES annual_plans(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    priority INTEGER NOT NULL DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (annual_plan_id, department_id)
);

-- إنشاء indexes
CREATE INDEX IF NOT EXISTS ix_annual_plan_departments_plan ON annual_plan_departments(annual_plan_id);
CREATE INDEX IF NOT EXISTS ix_annual_plan_departments_dept ON annual_plan_departments(department_id);
