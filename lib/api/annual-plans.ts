import { apiClient } from "./client"
import type { AnnualPlan, PageResponse } from "./types"

export const annualPlansApi = {
  async list(page = 1, size = 20): Promise<PageResponse<AnnualPlan>> {
    return apiClient.get<PageResponse<AnnualPlan>>(`/annual-plans?page=${page}&size=${size}`)
  },

  async get(id: string): Promise<AnnualPlan> {
    return apiClient.get<AnnualPlan>(`/annual-plans/${id}`)
  },

  async create(data: Partial<AnnualPlan>): Promise<AnnualPlan> {
    return apiClient.post<AnnualPlan>("/annual-plans", data)
  },

  async update(id: string, data: Partial<AnnualPlan>): Promise<AnnualPlan> {
    return apiClient.put<AnnualPlan>(`/annual-plans/${id}`, data)
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/annual-plans/${id}`)
  },
}
