import { apiClient } from './client'

export interface Finding {
  id: string
  engagement_id: string
  title: string
  description: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  category: string
  recommendation: string
  management_response?: string
  target_date?: string
  created_at: string
  updated_at: string
}

export interface FindingCreate {
  engagement_id: string
  title: string
  description: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  category: string
  recommendation: string
  target_date?: string
}

export interface FindingsPage {
  items: Finding[]
  page: number
  size: number
  total: number
}

export interface FindingsFilters {
  page?: number
  size?: number
  engagement_id?: string
  severity?: string
  status?: string
}

export const findingsApi = {
  /**
   * Get paginated list of findings
   */
  async list(filters: FindingsFilters = {}): Promise<FindingsPage> {
    const params = new URLSearchParams()
    if (filters.page) params.append('page', String(filters.page))
    if (filters.size) params.append('size', String(filters.size))
    if (filters.engagement_id) params.append('engagement_id', filters.engagement_id)
    if (filters.severity) params.append('severity', filters.severity)
    if (filters.status) params.append('status', filters.status)

    const response = await apiClient.get<FindingsPage>(
      `/findings?${params.toString()}`
    )
    return response.data
  },

  /**
   * Create a new finding
   */
  async create(data: FindingCreate): Promise<Finding> {
    const response = await apiClient.post<Finding>('/findings', data)
    return response.data
  },

  /**
   * Get a single finding by ID
   */
  async get(id: string): Promise<Finding> {
    const response = await apiClient.get<Finding>(`/findings/${id}`)
    return response.data
  },

  /**
   * Update a finding
   */
  async update(id: string, data: Partial<FindingCreate>): Promise<Finding> {
    const response = await apiClient.put<Finding>(`/findings/${id}`, data)
    return response.data
  },

  /**
   * Delete a finding
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/findings/${id}`)
  },

  /**
   * Update finding status
   */
  async updateStatus(id: string, status: Finding['status']): Promise<Finding> {
    const response = await apiClient.put<Finding>(`/findings/${id}/status`, { status })
    return response.data
  },
}
