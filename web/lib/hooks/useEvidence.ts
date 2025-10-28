import { useState, useEffect, useCallback } from 'react'
import { evidenceApi, Evidence, EvidenceFilters } from '@/lib/api'

export function useEvidence(filters: EvidenceFilters = {}) {
  const [evidence, setEvidence] = useState<Evidence[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadEvidence = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await evidenceApi.list({ ...filters })
      setEvidence(data)
      setTotal(data.length)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load evidence')
      console.error('Failed to load evidence:', err)
    } finally {
      setLoading(false)
    }
  }, [filters.engagement_id])

  useEffect(() => {
    loadEvidence()
  }, [loadEvidence])

  async function uploadEvidence(data: Parameters<typeof evidenceApi.upload>[0]) {
    try {
      setLoading(true)
      setError(null)
      const newEvidence = await evidenceApi.upload(data)
      setEvidence(prev => [newEvidence, ...prev])
      setTotal(prev => prev + 1)
      return newEvidence
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload evidence')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // create/update are not supported by backend; upload + delete only

  async function deleteEvidence(id: string) {
    try {
      setLoading(true)
      setError(null)
      await evidenceApi.delete(id)
      setEvidence(prev => prev.filter(e => e.id !== id))
      setTotal(prev => prev - 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete evidence')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const refresh = useCallback(() => {
    loadEvidence()
  }, [loadEvidence])

  return {
    evidence,
    total,
    loading,
    error,
    uploadEvidence,
    deleteEvidence,
    refresh,
  }
}
