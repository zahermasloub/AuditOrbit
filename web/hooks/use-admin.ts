/**
 * Admin Hooks - AuditOrbit
 * Custom hooks for fetching admin dashboard data
 */

import { useQuery } from "@tanstack/react-query";
import type {
  AdminKPIs,
  EngagementTrend,
  UserActivity,
  ActivityFeed,
  AdminUser,
  AdminRole,
  AuditLog,
} from "@/types/admin";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Helper function to get auth headers
const getAuthHeaders = () => {
  // Try to get token from localStorage (only in browser)
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }
  return {
    "Content-Type": "application/json",
  };
};

// Fetch Admin KPIs
export function useAdminKPIs() {
  return useQuery<AdminKPIs>({
    queryKey: ["admin", "kpis"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/admin/kpis`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        // Return mock data on error for development
        return {
          total_engagements: 0,
          completed_engagements: 0,
          completion_rate: 0,
          total_findings: 0,
          high_risk_findings: 0,
          high_risk_percentage: 0,
          total_reports: 0,
          published_reports: 0,
          active_users: 0,
          avg_completion_time_days: 0,
        };
      }
      return response.json();
    },
    staleTime: 60000, // 1 minute
    refetchInterval: 300000, // 5 minutes
    retry: false, // Don't retry on error
  });
}

// Fetch Engagements Trend
export function useEngagementsTrend() {
  return useQuery<EngagementTrend[]>({
    queryKey: ["admin", "engagements-trend"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/admin/engagements-trend`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) return [];
      return response.json();
    },
    staleTime: 120000, // 2 minutes
    retry: false,
  });
}

// Fetch User Activity
export function useUserActivity() {
  return useQuery<UserActivity[]>({
    queryKey: ["admin", "user-activity"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/admin/user-activity`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) return [];
      return response.json();
    },
    staleTime: 120000, // 2 minutes
    retry: false,
  });
}

// Fetch Recent Activities
export function useRecentActivities(limit = 10) {
  return useQuery<ActivityFeed[]>({
    queryKey: ["admin", "recent-activities", limit],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE_URL}/admin/recent-activities?limit=${limit}`,
        {
          headers: getAuthHeaders(),
        }
      );
      if (!response.ok) return [];
      return response.json();
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // 1 minute
    retry: false,
  });
}

// Fetch Findings by Severity
export function useFindingsBySeverity() {
  return useQuery({
    queryKey: ["dashboard", "findings-by-severity"],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE_URL}/dashboard/findings-by-severity`,
        {
          headers: getAuthHeaders(),
        }
      );
      if (!response.ok) return [];
      return response.json();
    },
    staleTime: 120000, // 2 minutes
    retry: false,
  });
}

// Fetch Users List
export function useUsersList(page = 1, size = 20) {
  return useQuery<{ items: AdminUser[]; total: number; page: number; size: number }>({
    queryKey: ["users", "list", page, size],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE_URL}/users?page=${page}&size=${size}`,
        {
          headers: getAuthHeaders(),
        }
      );
      if (!response.ok) return { items: [], total: 0, page, size };
      return response.json();
    },
    staleTime: 60000, // 1 minute
    retry: false,
  });
}

// Fetch Roles List
export function useRolesList() {
  return useQuery<AdminRole[]>({
    queryKey: ["roles", "list"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/roles`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) return [];
      return response.json();
    },
    staleTime: 300000, // 5 minutes
    retry: false,
  });
}

// Fetch Audit Logs
export function useAuditLogs(
  page = 1,
  size = 20,
  filters?: {
    actor_id?: string;
    action?: string;
    resource_like?: string;
  }
) {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    ...(filters?.actor_id && { actor_id: filters.actor_id }),
    ...(filters?.action && { action: filters.action }),
    ...(filters?.resource_like && { resource_like: filters.resource_like }),
  });

  return useQuery<{ items: AuditLog[]; total: number; page: number; size: number }>({
    queryKey: ["audit-logs", page, size, filters],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE_URL}/audit-logs?${queryParams.toString()}`,
        {
          headers: getAuthHeaders(),
        }
      );
      if (!response.ok) return { items: [], total: 0, page, size };
      return response.json();
    },
    staleTime: 60000, // 1 minute
    retry: false,
  });
}

// Fetch User Statistics
export function useUsersStats() {
  return useQuery({
    queryKey: ["admin", "users-stats"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/admin/users-stats`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) return { total_users: 0, recent_logins: 0, by_role: [] };
      return response.json();
    },
    staleTime: 120000, // 2 minutes
    retry: false,
  });
}
