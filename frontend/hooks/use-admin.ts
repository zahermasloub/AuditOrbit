/**
 * Admin Hooks - AuditOrbit
 * Custom hooks for fetching admin dashboard data
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

// Helper: safely read token from browser storage/cookies
const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    const ls = window.localStorage;
    const token =
      ls.getItem("auth_token") ||
      ls.getItem("access_token") ||
      ls.getItem("token");
    if (token && token.trim().length > 0) return token;
    // fallback to cookies if present
    const cookies = document.cookie || "";
    const m = cookies.match(/(?:^|; )(?:auth_token|access_token|token)=([^;]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  } catch {
    return null;
  }
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
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
      console.log("🔓 جلب المستخدمين بدون مصادقة (وضع التطوير)");
      const response = await fetch(
        `${API_BASE_URL}/users?page=${page}&size=${size}`,
        {
          headers: getAuthHeaders(),
        }
      );
      
      if (!response.ok) {
        console.error("Failed to fetch users:", response.status, response.statusText);
        return { items: [], total: 0, page, size };
      }
      
      const data = await response.json();
      console.log("Users fetched successfully:", data);
      return data;
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

// Create User Mutation
export function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userData: {
      name: string;
      email: string;
      password: string;
      role?: string;
      locale?: string;
      active?: boolean;
    }) => {
      console.log("Creating user (with auth if available)");
      console.log("User data:", { ...userData, password: "***" });
      
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
      });
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        if (response.status === 401) {
          console.error("401 Unauthorized - Token may be invalid or expired");
          throw new Error("غير مصرح. الرجاء تسجيل الدخول مرة أخرى");
        }
        let detail = "فشل في إنشاء المستخدم";
        try {
          const error = await response.json();
          detail = error?.detail || error?.message || detail;
        } catch {
          // ignore parse error
        }
        console.error("API error while creating user:", detail);
        throw new Error(detail);
      }
      
      const result = await response.json();
      console.log("User created successfully:", result);
      return result;
    },
    onSuccess: () => {
      // Invalidate users list to refetch after successful creation
      queryClient.invalidateQueries({ queryKey: ["users", "list"] });
    },
    onError: (error) => {
      console.error("Mutation error:", error);
    },
  });
}

// Update User Mutation
export function useUpdateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      userId, 
      userData 
    }: { 
      userId: string; 
      userData: {
        name?: string;
        email?: string;
        password?: string;
        role?: string;
        locale?: string;
        active?: boolean;
      };
    }) => {
      console.log("Updating user (with auth if available)");
      console.log("User ID:", userId);
      
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          // المستخدم غير موجود - إعادة تحميل القائمة تلقائياً
          console.warn(`⚠️ User ${userId} not found - refreshing list`);
          await queryClient.invalidateQueries({ queryKey: ["users", "list"] });
          throw new Error("المستخدم غير موجود أو تم حذفه. تم تحديث القائمة.");
        }
        let detail = "فشل في تحديث المستخدم";
        try {
          const error = await response.json();
          detail = error?.detail || error?.message || detail;
        } catch {
          // noop
        }
        throw new Error(detail);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "list"] });
    },
    onError: (error) => {
      console.error("Update user error:", error);
      // إعادة تحميل القائمة في حالة حدوث خطأ
      queryClient.invalidateQueries({ queryKey: ["users", "list"] });
    },
  });
}

// Delete User Mutation
export function useDeleteUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      console.log("Deleting user (with auth if available)");
      console.log("User ID:", userId);
      
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          // المستخدم غير موجود - إعادة تحميل القائمة تلقائياً
          console.warn(`⚠️ User ${userId} not found - refreshing list`);
          await queryClient.invalidateQueries({ queryKey: ["users", "list"] });
          throw new Error("المستخدم غير موجود أو تم حذفه مسبقاً. تم تحديث القائمة.");
        }
        let detail = "فشل في حذف المستخدم";
        try {
          const error = await response.json();
          detail = error?.detail || error?.message || detail;
        } catch {
          // noop
        }
        throw new Error(detail);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "list"] });
    },
    onError: (error) => {
      console.error("Delete user error:", error);
      // إعادة تحميل القائمة في حالة حدوث خطأ
      queryClient.invalidateQueries({ queryKey: ["users", "list"] });
    },
  });
}

// Toggle User Status Mutation (تفعيل/تعطيل المستخدم)
export function useToggleUserStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, active }: { userId: string; active: boolean }) => {
      console.log("Toggling user status (with auth if available)");
      console.log("User ID:", userId, "Active:", active);
      
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ active }),
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          // المستخدم غير موجود - إعادة تحميل القائمة تلقائياً
          console.warn(`⚠️ User ${userId} not found - refreshing list`);
          await queryClient.invalidateQueries({ queryKey: ["users", "list"] });
          throw new Error("المستخدم غير موجود أو تم حذفه. تم تحديث القائمة.");
        }
        let detail = "فشل في تحديث حالة المستخدم";
        try {
          const error = await response.json();
          detail = error?.detail || error?.message || detail;
        } catch {
          // noop
        }
        throw new Error(detail);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "list"] });
    },
    onError: (error) => {
      console.error("Toggle user status error:", error);
      // إعادة تحميل القائمة في حالة حدوث خطأ
      queryClient.invalidateQueries({ queryKey: ["users", "list"] });
    },
  });
}
