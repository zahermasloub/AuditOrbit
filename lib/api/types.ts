export interface User {
  id: string
  email: string
  name: string
  locale: string
  tz: string
  active: boolean
  created_at: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

export interface PageResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
  pages: number
}

export interface AnnualPlan {
  id: string
  year: number
  title: string
  description: string | null
  status: "draft" | "approved" | "active" | "closed"
  created_at: string
  updated_at: string
}

export interface Engagement {
  id: string
  annual_plan_id: string
  title: string
  description: string | null
  status: "planning" | "fieldwork" | "reporting" | "completed" | "cancelled"
  start_date: string | null
  end_date: string | null
  created_at: string
  updated_at: string
}

export interface Checklist {
  id: string
  name: string
  description: string | null
  created_at: string
}

export interface ChecklistItem {
  id: string
  checklist_id: string
  text: string
  order_num: number
}

export interface Evidence {
  id: string
  engagement_id: string
  filename: string
  size_bytes: number
  mime_type: string
  status: "pending" | "ready" | "failed"
  uploaded_by: string
  created_at: string
}

export interface Finding {
  id: string
  evidence_id: string
  scenario_id: string
  title: string
  description: string
  severity: "low" | "medium" | "high" | "critical"
  status: "draft" | "review" | "approved"
  created_at: string
}

export interface Report {
  id: string
  engagement_id: string
  title: string
  status: "draft" | "submitted" | "approved" | "published"
  content: string | null
  created_at: string
  updated_at: string
}

export interface WorkingPaper {
  id: string
  engagement_id: string
  title: string
  content: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface Sample {
  id: string
  engagement_id: string
  description: string
  size: number
  status: "pending" | "tested" | "passed" | "failed"
  created_at: string
}

export interface FollowUp {
  id: string
  finding_id: string
  status: "pending" | "in_progress" | "completed" | "overdue"
  due_date: string
  created_at: string
  updated_at: string
}

export interface ManagementResponse {
  id: string
  finding_id: string
  response_text: string
  action_plan: string | null
  responsible_person: string | null
  target_date: string | null
  created_at: string
}
