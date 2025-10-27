import { apiClient } from './client'

export interface Evidence {
  id: string
  engagement_id: string
  finding_id?: string
  title: string
  description?: string
  type: 'document' | 'screenshot' | 'data' | 'interview' | 'observation' | 'other'
  file_name?: string
  file_path?: string
  file_size?: number
  file_type?: string
  uploaded_by?: string
  created_at: string
  updated_at: string
}

export interface EvidenceCreate {
  engagement_id: string
  finding_id?: string
  title: string
  description?: string
  type: 'document' | 'screenshot' | 'data' | 'interview' | 'observation' | 'other'
}

export interface EvidenceUpload extends EvidenceCreate {
  file: File
}

export interface EvidencePage {
  items: Evidence[]
  page: number
  size: number
  total: number
}

export interface EvidenceFilters {
  page?: number
  size?: number
  engagement_id?: string
  finding_id?: string
  type?: string
}

export const evidenceApi = {
  /**
   * Get paginated list of evidence
   */
  async list(filters: EvidenceFilters = {}): Promise<EvidencePage> {
    const params = new URLSearchParams()
    if (filters.page) params.append('page', String(filters.page))
    if (filters.size) params.append('size', String(filters.size))
    if (filters.engagement_id) params.append('engagement_id', filters.engagement_id)
    if (filters.finding_id) params.append('finding_id', filters.finding_id)
    if (filters.type) params.append('type', filters.type)

    const response = await apiClient.get<EvidencePage>(
      `/evidence?${params.toString()}`
    )
    return response.data
  },

  /**
   * Upload evidence with file
   */
  async upload(data: EvidenceUpload): Promise<Evidence> {
    const formData = new FormData()
    formData.append('file', data.file)
    formData.append('engagement_id', data.engagement_id)
    if (data.finding_id) formData.append('finding_id', data.finding_id)
    formData.append('title', data.title)
    if (data.description) formData.append('description', data.description)
    formData.append('type', data.type)

    const token = localStorage.getItem('access_token')
    const headers: Record<string, string> = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/evidence/upload`, {
      method: 'POST',
      headers,
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Failed to upload evidence')
    }

    return response.json()
  },

  /**
   * Create evidence without file
   */
  async create(data: EvidenceCreate): Promise<Evidence> {
    const response = await apiClient.post<Evidence>('/evidence', data)
    return response.data
  },

  /**
   * Get a single evidence by ID
   */
  async get(id: string): Promise<Evidence> {
    const response = await apiClient.get<Evidence>(`/evidence/${id}`)
    return response.data
  },

  /**
   * Update evidence
   */
  async update(id: string, data: Partial<EvidenceCreate>): Promise<Evidence> {
    const response = await apiClient.put<Evidence>(`/evidence/${id}`, data)
    return response.data
  },

  /**
   * Delete evidence
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/evidence/${id}`)
  },

  /**
   * Download evidence file
   */
  async download(id: string): Promise<Blob> {
    const response = await apiClient.get<Blob>(`/evidence/${id}/download`)
    return response.data
  },
}
