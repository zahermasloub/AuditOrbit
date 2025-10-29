// ============================================================================
// ADMIN PAGE TYPES - AuditOrbit
// ============================================================================

export interface AdminKPIs {
  total_engagements: number;
  completed_engagements: number;
  completion_rate: number;
  total_findings: number;
  high_risk_findings: number;
  high_risk_percentage: number;
  total_reports: number;
  published_reports: number;
  active_users: number;
  avg_completion_time_days: number;
}

export interface EngagementTrend {
  period: string;
  total: number;
  completed: number;
}

export interface FindingBySeverity {
  name: string;
  value: number;
  color: string;
}

export interface UserActivity {
  day: string;
  logins: number;
  actions: number;
}

export interface ActivityFeed {
  id: string;
  action: string;
  user_name: string;
  resource_type: string;
  created_at: string;
  icon?: string;
  color?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  last_login: string;
  engagements: number;
  avatar: string;
}

export interface AdminRole {
  id: string;
  name: string;
  description: string;
  users_count: number;
  permissions_count: number;
  color: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  details: string;
  ip: string;
  status: "success" | "warning" | "error";
}

export type AdminSection =
  | "dashboard"
  | "users"
  | "roles"
  | "audit-logs"
  | "reports"
  | "notifications"
  | "settings";

export interface MenuItem {
  id: AdminSection;
  label: string;
  icon: any;
}
