import { apiClient } from './client'

export interface Engagement {
  id: string
  annual_plan_id: string
  title: string
  scope: string
  risk_rating: 'high' | 'medium' | 'low'
  status: 'planned' | 'in_progress' | 'review' | 'completed' | 'cancelled'
  start_date: string | null
  end_date: string | null
  created_at: string
}

export interface EngagementCreate {
  title: string
  scope: string
  risk_rating: 'high' | 'medium' | 'low'
  annual_plan_year: number
}

export interface EngagementsPage {
  items: Engagement[]
  page: number
  size: number
  total: number
}

export interface EngagementsFilters {
  page?: number
  size?: number
  status?: string
}

export const engagementsApi = {
  /**
   * Get paginated list of engagements
   */
  async list(filters: EngagementsFilters = {}): Promise<EngagementsPage> {
    const params = new URLSearchParams()
    if (filters.page) params.append('page', String(filters.page))
    if (filters.size) params.append('size', String(filters.size))
    if (filters.status) params.append('status', filters.status)

    const response = await apiClient.get<EngagementsPage>(
      `/engagements?${params.toString()}`
    )
    return response.data
  },

  /**
   * Create a new engagement
   */
  async create(data: EngagementCreate): Promise<Engagement> {
    const response = await apiClient.post<Engagement>('/engagements', data)
    return response.data
  },

  /**
   * Get a single engagement by ID
   */
  async get(id: string): Promise<Engagement> {
    const response = await apiClient.get<Engagement>(`/engagements/${id}`)
    return response.data
  },

  /**
   * Update an engagement
   */
  async update(id: string, data: Partial<EngagementCreate>): Promise<Engagement> {
    const response = await apiClient.put<Engagement>(`/engagements/${id}`, data)
    return response.data
  },

  /**
   * Delete an engagement
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/engagements/${id}`)
  },
}
