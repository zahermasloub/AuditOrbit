import { apiClient } from "./client"
import type { Evidence } from "./types"

export const evidenceApi = {
  async list(engagementId?: string): Promise<Evidence[]> {
    const params = engagementId ? `?engagement_id=${engagementId}` : ""
    return apiClient.get<Evidence[]>(`/evidence${params}`)
  },

  async initUpload(data: { engagement_id: string; filename: string; size_bytes: number; mime_type: string }) {
    return apiClient.post<{ evidence_id: string; upload_url: string }>("/evidence/init", data)
  },

  async confirmUpload(id: string, data: { s3_key: string }) {
    return apiClient.post<Evidence>(`/evidence/${id}/confirm`, data)
  },

  async getDownloadUrl(id: string): Promise<{ url: string }> {
    return apiClient.get<{ url: string }>(`/evidence/${id}/download`)
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/evidence/${id}`)
  },

  async extract(evidenceId: string): Promise<{ queued: boolean; job_id: string }> {
    return apiClient.post<{ queued: boolean; job_id: string }>(`/ai/extract/${evidenceId}`)
  },

  async getExtractions(evidenceId?: string) {
    const params = evidenceId ? `?evidence_id=${evidenceId}` : ""
    return apiClient.get(`/ai/extractions${params}`)
  },
}
