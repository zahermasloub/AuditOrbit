import { apiClient } from "./client"
import type { Engagement, PageResponse } from "./types"

export const engagementsApi = {
  async list(page = 1, size = 20, status?: string): Promise<PageResponse<Engagement>> {
    const params = new URLSearchParams({ page: String(page), size: String(size) })
    if (status) params.append("status", status)
    return apiClient.get<PageResponse<Engagement>>(`/engagements?${params}`)
  },

  async get(id: string): Promise<Engagement> {
    return apiClient.get<Engagement>(`/engagements/${id}`)
  },

  async create(data: Partial<Engagement>): Promise<Engagement> {
    return apiClient.post<Engagement>("/engagements", data)
  },

  async update(id: string, data: Partial<Engagement>): Promise<Engagement> {
    return apiClient.put<Engagement>(`/engagements/${id}`, data)
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/engagements/${id}`)
  },
}
