import { apiClient } from './client'

export interface Report {
  id: string
  engagement_id: string
  title: string
  type: 'audit' | 'summary' | 'executive' | 'detailed'
  status: 'draft' | 'review' | 'approved' | 'published'
  content?: string
  executive_summary?: string
  findings_count?: number
  recommendations_count?: number
  created_by?: string
  created_at: string
  updated_at: string
  published_at?: string
}

export interface ReportCreate {
  engagement_id: string
  title: string
  type: 'audit' | 'summary' | 'executive' | 'detailed'
  content?: string
  executive_summary?: string
}

export interface ReportsPage {
  items: Report[]
  page: number
  size: number
  total: number
}

export interface ReportsFilters {
  page?: number
  size?: number
  engagement_id?: string
  type?: string
  status?: string
}

export const reportsApi = {
  /**
   * Get paginated list of reports
   */
  async list(filters: ReportsFilters = {}): Promise<ReportsPage> {
    const params = new URLSearchParams()
    if (filters.page) params.append('page', String(filters.page))
    if (filters.size) params.append('size', String(filters.size))
    if (filters.engagement_id) params.append('engagement_id', filters.engagement_id)
    if (filters.type) params.append('type', filters.type)
    if (filters.status) params.append('status', filters.status)

    const response = await apiClient.get<ReportsPage>(
      `/reports?${params.toString()}`
    )
    return response.data
  },

  /**
   * Create a new report
   */
  async create(data: ReportCreate): Promise<Report> {
    const response = await apiClient.post<Report>('/reports', data)
    return response.data
  },

  /**
   * Get a single report by ID
   */
  async get(id: string): Promise<Report> {
    const response = await apiClient.get<Report>(`/reports/${id}`)
    return response.data
  },

  /**
   * Update a report
   */
  async update(id: string, data: Partial<ReportCreate>): Promise<Report> {
    const response = await apiClient.put<Report>(`/reports/${id}`, data)
    return response.data
  },

  /**
   * Delete a report
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/reports/${id}`)
  },

  /**
   * Update report status
   */
  async updateStatus(id: string, status: Report['status']): Promise<Report> {
    const response = await apiClient.put<Report>(`/reports/${id}/status`, { status })
    return response.data
  },

  /**
   * Generate report (trigger report generation)
   */
  async generate(id: string): Promise<Report> {
    const response = await apiClient.post<Report>(`/reports/${id}/generate`, {})
    return response.data
  },

  /**
   * Download report as PDF
   */
  async download(id: string): Promise<Blob> {
    const response = await apiClient.get<Blob>(`/reports/${id}/download`)
    return response.data
  },
}
