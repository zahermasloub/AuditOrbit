import { apiClient } from './client'

export interface DashboardStats {
  active_engagements: number
  open_findings: number
  pending_reports: number
  completion_rate: number
}

export interface EngagementStatusData {
  name: string
  value: number
}

export interface FindingSeverityData {
  name: string
  value: number
}

export interface RecentEngagement {
  id: string
  title: string
  status: string
  progress: number
  start_date: string | null
  end_date: string | null
  priority?: string | null
  department?: string | null
}

export const dashboardApi = {
  /**
   * Get dashboard statistics
   */
  async getStats(): Promise<DashboardStats> {
    const response = await apiClient.get<DashboardStats>('/dashboard/stats')
    return response.data
  },

  /**
   * Get engagements grouped by status
   */
  async getEngagementsByStatus(): Promise<EngagementStatusData[]> {
    const response = await apiClient.get<EngagementStatusData[]>(
      '/dashboard/engagements-by-status'
    )
    return response.data
  },

  /**
   * Get findings grouped by severity
   */
  async getFindingsBySeverity(): Promise<FindingSeverityData[]> {
    const response = await apiClient.get<FindingSeverityData[]>(
      '/dashboard/findings-by-severity'
    )
    return response.data
  },

  /**
   * Get recent engagements
   */
  async getRecentEngagements(): Promise<RecentEngagement[]> {
    const response = await apiClient.get<RecentEngagement[]>(
      '/dashboard/recent-engagements'
    )
    return response.data
  },
}
