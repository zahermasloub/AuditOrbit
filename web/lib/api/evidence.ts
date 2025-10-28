import { apiClient } from './client'

// Align types with backend EvidenceOut
export interface Evidence {
  id: string
  filename: string
  mime_type?: string | null
  size_bytes?: number | null
  status: string
  created_at: string
}

export interface EvidenceFilters {
  engagement_id?: string
}

export interface EvidenceInitIn {
  engagement_id: string
  filename: string
  mime_type?: string | null
  size_bytes?: number | null
}

export interface EvidenceInitOut {
  evidence_id: string
  bucket: string
  object_key: string
  upload_url: string
}

export interface EvidenceConfirmIn {
  size_bytes?: number | null
  mime_type?: string | null
}

export const evidenceApi = {
  // Get evidence list (optionally filtered by engagement)
  async list(filters: EvidenceFilters = {}): Promise<Evidence[]> {
    const params = new URLSearchParams()
    if (filters.engagement_id) params.append('engagement_id', filters.engagement_id)
    const response = await apiClient.get<Evidence[]>(`/evidence?${params.toString()}`)
    return response.data
  },

  // Upload using init -> PUT -> confirm
  async upload(params: { engagement_id: string; file: File }): Promise<Evidence> {
    // 1) init
    const initBody: EvidenceInitIn = {
      engagement_id: params.engagement_id,
      filename: params.file.name,
      mime_type: params.file.type || undefined,
      size_bytes: params.file.size,
    }
    const initRes = await apiClient.post<EvidenceInitOut>('/evidence/init', initBody)
    const init = initRes.data

    // 2) PUT to presigned URL
    await fetch(init.upload_url, {
      method: 'PUT',
      body: params.file,
      headers: initBody.mime_type ? { 'Content-Type': initBody.mime_type } : undefined,
    })

    // 3) confirm
    const confirmBody: EvidenceConfirmIn = {
      size_bytes: initBody.size_bytes,
      mime_type: initBody.mime_type,
    }
    const confirmRes = await apiClient.post<Evidence>(`/evidence/${init.evidence_id}/confirm`, confirmBody)
    return confirmRes.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/evidence/${id}`)
  },

  async getDownloadUrl(id: string): Promise<string> {
    const res = await apiClient.get<{ url: string }>(`/evidence/${id}/download`)
    return res.data.url
  },
}
